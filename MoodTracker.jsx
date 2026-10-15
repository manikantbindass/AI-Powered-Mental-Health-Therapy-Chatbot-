import React, { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import apiClient from "../api/client";

const MOODS = [
  { score: 1, label: "Very Low", emoji: "😔" },
  { score: 2, label: "Low", emoji: "😕" },
  { score: 3, label: "Neutral", emoji: "😐" },
  { score: 4, label: "Good", emoji: "🙂" },
  { score: 5, label: "Great", emoji: "😊" },
];

export default function MoodTracker() {
  const [score, setScore] = useState(4);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const load = async () => {
    const [m, a] = await Promise.all([apiClient.get("/moods/"), apiClient.get("/moods/analytics/")]);
    setEntries(m.data.results || m.data);
    setAnalytics(a.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await apiClient.post("/moods/", { mood_score: score, note });
    setNote("");
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mood Tracker</h1>
      <form onSubmit={submit} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => (
            <button key={m.score} type="button" onClick={() => setScore(m.score)} className={`p-3 rounded-xl border text-center ${score === m.score ? "border-sage-600 bg-sage-50 dark:bg-slate-700 font-bold" : ""}`}>
              <div className="text-2xl">{m.emoji}</div>
              <div className="text-xs">{m.label}</div>
            </button>
          ))}
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional reflection note..." className="w-full rounded-xl border p-3 text-sm bg-transparent" />
        <button type="submit" className="px-5 py-2 rounded-xl bg-sage-600 text-white text-sm font-medium">Save Mood</button>
      </form>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-64">
        <h2 className="text-sm font-semibold mb-2">7-Day Trend (Avg: {analytics?.average_7d ?? "—"})</h2>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={analytics?.series_7d || []}>
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Tooltip />
            <Line type="monotone" dataKey="mood_score" stroke="#476b4c" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between text-sm">
            <span><strong>{e.mood_label} ({e.mood_score}/5)</strong> {e.note && `— ${e.note}`}</span>
            <span className="text-xs text-slate-400">{new Date(e.recorded_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
