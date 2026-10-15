from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserMeView, UserDataExportView, ChatSessionViewSet, MoodEntryViewSet,
    JournalEntryViewSet, WellnessExercisesView, WellnessMeditationsView, WellnessSessionListCreateView, CrisisResourcesView
)

router = DefaultRouter()
router.register(r"chat/sessions", ChatSessionViewSet, basename="chat-sessions")
router.register(r"moods", MoodEntryViewSet, basename="moods")
router.register(r"journal", JournalEntryViewSet, basename="journal")

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", TokenObtainPairView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("users/me/", UserMeView.as_view()),
    path("users/me/export/", UserDataExportView.as_view()),
    path("wellness/exercises/", WellnessExercisesView.as_view()),
    path("wellness/meditations/", WellnessMeditationsView.as_view()),
    path("wellness/sessions/", WellnessSessionListCreateView.as_view()),
    path("crisis-resources/", CrisisResourcesView.as_view()),
    path("", include(router.urls)),
]
