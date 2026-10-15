import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class UserProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    display_name = models.CharField(max_length=100, blank=True)
    region_code = models.CharField(max_length=10, default="IN")
    theme_preference = models.CharField(max_length=10, default="light")
    reduced_motion = models.BooleanField(default=False)
    trusted_contact_name = models.CharField(max_length=100, blank=True)
    trusted_contact_phone = models.CharField(max_length=30, blank=True)
    ai_external_consent = models.BooleanField(default=True)
    data_retention_days = models.PositiveIntegerField(default=365)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_sessions")
    title = models.CharField(max_length=160, default="Wellness Check-In")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["-updated_at"]

class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10)
    content = models.TextField()
    sentiment_label = models.CharField(max_length=20, blank=True, default="")
    sentiment_confidence = models.FloatField(default=0.0)
    emotion_tags = models.JSONField(default=list, blank=True)
    is_crisis_flagged = models.BooleanField(default=False)
    provider_label = models.CharField(max_length=60, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["created_at"]

class MoodEntry(models.Model):
    MOOD_LABELS = {1: "Very Low", 2: "Low", 3: "Neutral", 4: "Good", 5: "Great"}
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mood_entries")
    mood_score = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    emotion_tags = models.JSONField(default=list, blank=True)
    note = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["-recorded_at"]
    @property
    def mood_label(self) -> str:
        return self.MOOD_LABELS.get(self.mood_score, "Neutral")

class JournalEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="journal_entries")
    title = models.CharField(max_length=200)
    content = models.TextField()
    associated_mood = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    tags = models.JSONField(default=list, blank=True)
    sentiment_summary = models.CharField(max_length=32, blank=True, default="")
    is_private = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["-created_at"]

class WellnessExercise(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=150)
    category = models.CharField(max_length=30)
    duration_seconds = models.PositiveIntegerField(default=180)
    description = models.TextField()
    instructions = models.JSONField(default=list)
    inhale_seconds = models.PositiveSmallIntegerField(default=4)
    hold_seconds = models.PositiveSmallIntegerField(default=4)
    exhale_seconds = models.PositiveSmallIntegerField(default=6)
    recommended_for_moods = models.JSONField(default=list)

class WellnessSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wellness_sessions")
    exercise = models.ForeignKey(WellnessExercise, on_delete=models.SET_NULL, null=True, blank=True)
    exercise_title = models.CharField(max_length=150)
    category = models.CharField(max_length=30, default="breathing")
    duration_completed_seconds = models.PositiveIntegerField(default=60)
    reflection_note = models.TextField(blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-completed_at"]
