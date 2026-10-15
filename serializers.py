from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, ChatSession, ChatMessage, MoodEntry, JournalEntry, WellnessExercise, WellnessSession

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    display_name = serializers.CharField(required=False, allow_blank=True)
    region_code = serializers.CharField(required=False, default="IN")
    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "display_name", "region_code")
    def create(self, validated_data):
        display_name = validated_data.pop("display_name", "")
        region_code = validated_data.pop("region_code", "IN")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        UserProfile.objects.create(user=user, display_name=display_name or user.username, region_code=region_code)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", required=False)
    class Meta:
        model = UserProfile
        fields = ("id", "username", "email", "display_name", "region_code", "theme_preference", "reduced_motion", "trusted_contact_name", "trusted_contact_phone", "ai_external_consent", "data_retention_days", "created_at", "updated_at")
        read_only_fields = ("id", "username", "created_at", "updated_at")

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = "__all__"
        read_only_fields = ("id", "session", "sender", "sentiment_label", "sentiment_confidence", "emotion_tags", "is_crisis_flagged", "provider_label", "created_at")

class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    class Meta:
        model = ChatSession
        fields = ("id", "title", "messages", "created_at", "updated_at")

class MoodEntrySerializer(serializers.ModelSerializer):
    mood_label = serializers.CharField(read_only=True)
    class Meta:
        model = MoodEntry
        fields = ("id", "mood_score", "mood_label", "emotion_tags", "note", "recorded_at", "updated_at")

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ("id", "title", "content", "associated_mood", "tags", "sentiment_summary", "is_private", "created_at", "updated_at")
        read_only_fields = ("id", "sentiment_summary", "created_at", "updated_at")

class WellnessExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellnessExercise
        fields = "__all__"

class WellnessSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellnessSession
        fields = ("id", "exercise", "exercise_title", "category", "duration_completed_seconds", "reflection_note", "completed_at")
