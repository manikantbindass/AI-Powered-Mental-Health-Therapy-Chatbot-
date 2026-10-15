import React from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, MessageCircleHeart, BarChart3, Wind, BookLock, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-sage-700">
          <HeartHandshake className="w-7 h-7 text-sage-600" /> MindCare AI
        </div>
        <div className="flex gap-3 items-center">
          <Link to="/crisis" className="text-xs font-semibold text-rose-600 px-3 py-2 rounded-xl hover:bg-rose-50">24/7 Crisis Support</Link>
          <Link to="/auth" className="px-4 py-2 rounded-xl bg-sage-600 text-white text-sm font-medium">Get Started</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-16 text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">A calm, private space for emotional reflection and daily wellness.</h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Chat with an empathetic AI wellness companion, track your mood trends, practice guided breathing, and keep a private journal.</p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/auth" className="px-6 py-3 rounded-2xl bg-sage-600 text-white font-medium">Start Companion Chat</Link>
            <Link to="/crisis" className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">Crisis Helplines</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><MessageCircleHeart className="w-6 h-6 text-sage-600 mb-2" /><h3 className="font-semibold">Empathetic AI Companion</h3><p className="text-xs text-slate-500 mt-1">Reflective active listening with transparent AI labeling and crisis safety guardrails.</p></div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><BarChart3 className="w-6 h-6 text-sage-600 mb-2" /><h3 className="font-semibold">Mood Analytics</h3><p className="text-xs text-slate-500 mt-1">5-point mood tracking with 7-day and 30-day interactive Recharts trends.</p></div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><Wind className="w-6 h-6 text-sage-600 mb-2" /><h3 className="font-semibold">Guided Breathing</h3><p className="text-xs text-slate-500 mt-1">Animated Box Breathing (4-4-4) and 4-7-8 relaxation timers.</p></div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><BookLock className="w-6 h-6 text-sage-600 mb-2" /><h3 className="font-semibold">Private Journal</h3><p className="text-xs text-slate-500 mt-1">User-isolated reflections with full JSON export and one-click account deletion.</p></div>
        </div>
        <div className="p-4 rounded-2xl bg-sage-50 dark:bg-slate-800 border border-sage-100 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 justify-center">
          <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
          <span>Not a replacement for a licensed therapist, medical diagnosis, or emergency intervention.</span>
        </div>
      </main>
    </div>
  );
}
