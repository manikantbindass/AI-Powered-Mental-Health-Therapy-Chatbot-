from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg
from rest_framework import generics, viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

from ai.companion import WellnessCompanionService
from ai.sentiment import SentimentAnalyzer
from ai.safety import get_crisis_resources, CRISIS_RESOURCES_REGISTRY
from .models import UserProfile, ChatSession, ChatMessage, MoodEntry, JournalEntry, WellnessExercise, WellnessSession
from .serializers import (
    RegisterSerializer, UserProfileSerializer, ChatSessionSerializer, ChatMessageSerializer,
    MoodEntrySerializer, JournalEntrySerializer, WellnessExerciseSerializer, WellnessSessionSerializer
)
from .permissions import IsOwner

companion_service = WellnessCompanionService()
sentiment_analyzer = SentimentAnalyzer()

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_profile(self, user):
        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"display_name": user.username})
        return profile
    def get(self, request):
        return Response(UserProfileSerializer(self.get_profile(request.user)).data)
    def patch(self, request):
        profile = self.get_profile(request.user)
        s = UserProfileSerializer(profile, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)
    def delete(self, request):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserDataExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        u = request.user
        profile, _ = UserProfile.objects.get_or_create(user=u)
        return Response({
            "exported_at": timezone.now().isoformat(),
            "profile": UserProfileSerializer(profile).data,
            "mood_entries": MoodEntrySerializer(u.mood_entries.all(), many=True).data,
            "journal_entries": JournalEntrySerializer(u.journal_entries.all(), many=True).data,
            "chat_sessions": ChatSessionSerializer(u.chat_sessions.all(), many=True).data,
            "wellness_sessions": WellnessSessionSerializer(u.wellness_sessions.all(), many=True).data,
        })

class ChatSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).prefetch_related("messages")
    def perform_create(self, serializer):
        session = serializer.save(user=self.request.user)
        ChatMessage.objects.create(
            session=session, sender="ai",
            content="Hello! I'm MindCare AI, your supportive wellness companion. I'm an AI reflection tool—not a licensed therapist—here to listen without judgment. How are you feeling today?",
            sentiment_label="positive", sentiment_confidence=0.9, provider_label="system_greeting"
        )
    @action(detail=True, methods=["post"], url_path="messages")
    def send_message(self, request, pk=None):
        session = self.get_object()
        content = (request.data.get("content") or "").strip()
        if not content:
            return Response({"error": "Message cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        history = list(session.messages.order_by("created_at").values("sender", "content"))
        outcome = companion_service.generate_reply(content, history, profile.region_code, profile.ai_external_consent)
        sent = outcome["sentiment"]
        u_msg = ChatMessage.objects.create(
            session=session, sender="user", content=content,
            sentiment_label=sent.get("sentiment", "neutral"), sentiment_confidence=sent.get("confidence", 0.0),
            emotion_tags=sent.get("emotions", []), is_crisis_flagged=outcome["is_crisis"], provider_label="user"
        )
        ai_msg = ChatMessage.objects.create(
            session=session, sender="ai", content=outcome["reply"],
            sentiment_label="supportive", sentiment_confidence=1.0,
            is_crisis_flagged=outcome["is_crisis"], provider_label=outcome["provider"]
        )
        if session.title == "Wellness Check-In":
            session.title = content[:48]
            session.save()
        return Response({
            "user_message": ChatMessageSerializer(u_msg).data,
            "ai_message": ChatMessageSerializer(ai_msg).data,
            "safety": {"is_crisis": outcome["is_crisis"], "category": outcome["crisis_category"], "resources": outcome["crisis_resources"]},
            "is_mock": outcome["is_mock"],
        }, status=status.HTTP_201_CREATED)

class MoodEntryViewSet(viewsets.ModelViewSet):
    serializer_class = MoodEntrySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    @action(detail=False, methods=["get"], url_path="analytics")
    def analytics(self, request):
        now = timezone.now()
        qs7 = self.get_queryset().filter(recorded_at__gte=now - timedelta(days=7)).order_by("recorded_at")
        qs30 = self.get_queryset().filter(recorded_at__gte=now - timedelta(days=30)).order_by("recorded_at")
        avg7 = qs7.aggregate(a=Avg("mood_score"))["a"]
        avg30 = qs30.aggregate(a=Avg("mood_score"))["a"]
        return Response({
            "average_7d": round(avg7, 2) if avg7 else None,
            "average_30d": round(avg30, 2) if avg30 else None,
            "total_entries_30d": qs30.count(),
            "series_7d": [{"id": str(m.id), "date": m.recorded_at.strftime("%b %d"), "mood_score": m.mood_score, "mood_label": m.mood_label} for m in qs7],
            "series_30d": [{"id": str(m.id), "date": m.recorded_at.strftime("%b %d"), "mood_score": m.mood_score, "mood_label": m.mood_label} for m in qs30],
        })

class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    def get_queryset(self):
        qs = JournalEntry.objects.filter(user=self.request.user)
        q = self.request.query_params.get("search")
        if q:
            qs = qs.filter(title__icontains=q) | qs.filter(content__icontains=q)
        return qs.distinct()
    def perform_create(self, serializer):
        sent = sentiment_analyzer.analyze(serializer.validated_data.get("content", ""))
        serializer.save(user=self.request.user, sentiment_summary=sent.get("sentiment", "neutral"))
    def perform_update(self, serializer):
        sent = sentiment_analyzer.analyze(serializer.validated_data.get("content", serializer.instance.content))
        serializer.save(sentiment_summary=sent.get("sentiment", "neutral"))

class WellnessExercisesView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WellnessExerciseSerializer
    def get_queryset(self):
        if not WellnessExercise.objects.exists():
            WellnessExercise.objects.create(
                slug="box-breathing-4-4-4", title="Box Breathing (4-4-4)", category="breathing",
                duration_seconds=180, description="Rhythmic 4-second inhale, hold, and exhale to steady the nervous system.",
                instructions=["Inhale for 4s", "Hold for 4s", "Exhale for 4s"], inhale_seconds=4, hold_seconds=4, exhale_seconds=4
            )
            WellnessExercise.objects.create(
                slug="calming-breath-4-7-8", title="4-7-8 Calming Breath", category="breathing",
                duration_seconds=240, description="Extended exhalation to release acute physical tension.",
                instructions=["Inhale for 4s", "Hold for 7s", "Exhale for 8s"], inhale_seconds=4, hold_seconds=7, exhale_seconds=8
            )
            WellnessExercise.objects.create(
                slug="sensory-grounding-54321", title="5-4-3-2-1 Sensory Grounding", category="meditation",
                duration_seconds=300, description="Anchor awareness in the present room using all five senses.",
                instructions=["5 things you see", "4 things you feel", "3 sounds you hear"], inhale_seconds=4, hold_seconds=2, exhale_seconds=6
            )
        return WellnessExercise.objects.all()

class WellnessMeditationsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WellnessExerciseSerializer
    def get_queryset(self):
        WellnessExercisesView().get_queryset()
        return WellnessExercise.objects.filter(category="meditation")

class WellnessSessionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WellnessSessionSerializer
    def get_queryset(self):
        return WellnessSession.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CrisisResourcesView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        region = request.query_params.get("region", "IN").upper()
        return Response({"selected": get_crisis_resources(region), "registry": CRISIS_RESOURCES_REGISTRY})
