from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from ai.safety import evaluate_safety
from ai.sentiment import SentimentAnalyzer

class MindCareFullTestSuite(TestCase):
    def setUp(self):
        self.analyzer = SentimentAnalyzer()
        self.client_a = APIClient()
        self.client_b = APIClient()
        self.user_a = User.objects.create_user(username="alice", password="Password123!")
        self.user_b = User.objects.create_user(username="bob", password="Password123!")
        self.client_a.force_authenticate(user=self.user_a)
        self.client_b.force_authenticate(user=self.user_b)

    def test_crisis_detection_and_benign_idioms(self):
        crisis = evaluate_safety("I want to kill myself tonight", region_code="IN")
        self.assertTrue(crisis["is_crisis"])
        self.assertIn("Tele-MANAS", crisis["safe_response"])

        benign = evaluate_safety("This traffic is killing me and I am dying of laughter", region_code="IN")
        self.assertFalse(benign["is_crisis"])

    def test_sentiment_analysis_edge_cases(self):
        self.assertEqual(self.analyzer.analyze("")["sentiment"], "neutral")
        self.assertEqual(self.analyzer.analyze("I feel anxious and overwhelmed")["sentiment"], "negative")
        self.assertEqual(self.analyzer.analyze("I am not happy today")["sentiment"], "negative")

    def test_user_isolation_and_crud(self):
        j = self.client_a.post("/api/v1/journal/", {"title": "Private", "content": "Secret thoughts"}, format="json").data
        m = self.client_a.post("/api/v1/moods/", {"mood_score": 4, "note": "Calm"}, format="json").data
        self.assertEqual(self.client_b.get(f"/api/v1/journal/{j['id']}/").status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client_b.delete(f"/api/v1/moods/{m['id']}/").status_code, status.HTTP_404_NOT_FOUND)
