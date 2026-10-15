import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Send, PlusCircle, Trash2, Sparkles, ShieldAlert } from "lucide-react";
import apiClient from "../api/client";

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState(null);

  const loadSessions = async () => {
    const res = await apiClient.get("/chat/sessions/");
    const list = res.data.results || res.data;
    setSessions(list);
    if (list.length > 0 && !activeSession) loadSessionDetail(list[0].id);
  };

  const loadSessionDetail = async (id) => {
    const res = await apiClient.get(`/chat/sessions/${id}/`);
    setActiveSession(res.data);
  };

  const createNewSession = async () => {
    const res = await apiClient.post("/chat/sessions/", { title: "Wellness Check-In" });
    setSessions((prev) => [res.data, ...prev]);
    setActiveSession(res.data);
    setCrisisAlert(null);
  };

  useEffect(() => { loadSessions(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    let session = activeSession;
    if (!session) {
      const created = await apiClient.post("/chat/sessions/", { title: "Wellness Check-In" });
      session = created.data;
    }
    const text = input;
    setInput("");
    setSending(true);
    try {
      const res = await apiClient.post(`/chat/sessions/${session.id}/messages/`, { content: text });
      if (res.data.safety?.is_crisis) setCrisisAlert(res.data.safety);
      await loadSessionDetail(session.id);
      await loadSessions();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
        <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-sage-600" /> AI-generated supportive responses — not a licensed human therapist.</span>
        <Link to="/crisis" className="text-rose-600 font-semibold underline">Crisis Support</Link>
      </div>

      {crisisAlert && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> Immediate Crisis Support ({crisisAlert.resources?.region_name})</div>
          <div>Emergency Number: <strong>{crisisAlert.resources?.emergency_number}</strong></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[70vh]">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 flex flex-col">
          <button onClick={createNewSession} className="w-full py-2 px-3 rounded-xl bg-sage-600 text-white text-xs font-medium mb-3 flex items-center justify-center gap-1.5">
            <PlusCircle className="w-4 h-4" /> New Session
          </button>
          <div className="flex-1 overflow-y-auto space-y-1">
            {sessions.map((s) => (
              <div key={s.id} onClick={() => loadSessionDetail(s.id)} className={`p-2.5 rounded-xl text-xs cursor-pointer flex justify-between ${activeSession?.id === s.id ? "bg-sage-100 dark:bg-slate-700 font-semibold" : ""}`}>
                <span className="truncate">{s.title}</span>
                <button onClick={(e) => { e.stopPropagation(); apiClient.delete(`/chat/sessions/${s.id}/`).then(loadSessions); }}><Trash2 className="w-3.5 h-3.5 text-slate-400" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {activeSession?.messages?.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${m.sender === "user" ? "bg-sage-600 text-white" : "bg-warm-100 dark:bg-slate-700"}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Share how you're feeling..." className="flex-1 rounded-xl border px-3.5 py-2 text-sm bg-transparent" />
            <button type="submit" disabled={sending} className="px-4 py-2 rounded-xl bg-sage-600 text-white text-sm font-medium flex items-center gap-1"><Send className="w-4 h-4" /> Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
