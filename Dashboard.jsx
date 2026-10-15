import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircleHeart, SmilePlus, Wind, BookLock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    apiClient.get("/moods/analytics/").then((res) => setAnalytics(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user?.display_name || user?.username}</h1>
          <p className="text-sm text-slate-500 mt-1">Take a gentle breath. How would you like to support your wellbeing today?</p>
        </div>
        <Link to="/chat" className="px-5 py-2.5 rounded-xl bg-sage-600 text-white text-sm font-medium">Open AI Companion</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500">7-Day Mood Average</div>
          <div className="text-2xl font-bold mt-1">{analytics?.average_7d ? `${analytics.average_7d} / 5` : "No entries yet"}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500">30-Day Mood Average</div>
          <div className="text-2xl font-bold mt-1">{analytics?.average_30d ? `${analytics.average_30d} / 5` : "No entries yet"}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500">Entries Logged (30d)</div>
          <div className="text-2xl font-bold mt-1">{analytics?.total_entries_30d ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/chat" className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sage-500 space-y-2">
          <MessageCircleHeart className="w-6 h-6 text-sage-600" />
          <div className="font-semibold text-sm">AI Wellness Chat</div>
          <p className="text-xs text-slate-500">Reflect on thoughts in a calm, nonjudgmental space.</p>
        </Link>
        <Link to="/mood" className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sage-500 space-y-2">
          <SmilePlus className="w-6 h-6 text-sage-600" />
          <div className="font-semibold text-sm">Log Today's Mood</div>
          <p className="text-xs text-slate-500">Track emotional trends across 7 and 30 days.</p>
        </Link>
        <Link to="/meditation" className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sage-500 space-y-2">
          <Wind className="w-6 h-6 text-sage-600" />
          <div className="font-semibold text-sm">Guided Breathing</div>
          <p className="text-xs text-slate-500">Practice 4-4-4 Box Breathing or 5-4-3-2-1 Grounding.</p>
        </Link>
        <Link to="/journal" className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sage-500 space-y-2">
          <BookLock className="w-6 h-6 text-sage-600" />
          <div className="font-semibold text-sm">Private Journal</div>
          <p className="text-xs text-slate-500">Write and search private reflections securely.</p>
        </Link>
      </div>
    </div>
  );
}
