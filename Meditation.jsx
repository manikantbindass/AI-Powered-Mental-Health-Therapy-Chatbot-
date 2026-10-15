import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

export default function Meditation() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    apiClient.get("/wellness/exercises/").then((res) => {
      const list = res.data.results || res.data;
      setExercises(list);
      if (list.length) setSelected(list[0]);
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Guided Breathing & Mindfulness</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          {exercises.map((ex) => (
            <button key={ex.id} onClick={() => { setSelected(ex); setRunning(false); setSeconds(0); }} className={`w-full text-left p-4 rounded-2xl border ${selected?.id === ex.id ? "border-sage-600 bg-sage-50 dark:bg-slate-700" : "bg-white dark:bg-slate-800"}`}>
              <div className="font-semibold text-sm">{ex.title}</div>
              <div className="text-xs text-slate-500">{ex.description}</div>
            </button>
          ))}
        </div>
        <div className="md:col-span-2 p-8 rounded-2xl bg-white dark:bg-slate-800 border flex flex-col items-center justify-center space-y-6">
          <div className="w-40 h-40 rounded-full border-4 border-sage-500 flex flex-col items-center justify-center">
            <span className="font-semibold text-sm">{running ? "Breathe..." : "Ready"}</span>
            <span className="text-xs text-slate-400">{seconds}s</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRunning(!running)} className="px-5 py-2 rounded-xl bg-sage-600 text-white text-sm">{running ? "Pause" : "Start"}</button>
            <button onClick={() => { setRunning(false); setSeconds(0); }} className="px-4 py-2 rounded-xl border text-sm">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
