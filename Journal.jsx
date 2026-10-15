import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const load = async () => {
    const res = await apiClient.get("/journal/");
    setEntries(res.data.results || res.data);
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await apiClient.post("/journal/", { title, content, associated_mood: 4 });
    setTitle(""); setContent("");
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Private Journal</h1>
      <form onSubmit={save} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border space-y-3">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title..." className="w-full rounded-xl border p-2.5 text-sm bg-transparent" />
        <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Write freely..." className="w-full rounded-xl border p-3 text-sm bg-transparent" />
        <button type="submit" className="px-5 py-2 rounded-xl bg-sage-600 text-white text-sm">Save Entry</button>
      </form>
      <div className="space-y-3">
        {entries.map((item) => (
          <div key={item.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border space-y-1">
            <div className="flex justify-between">
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <button onClick={() => apiClient.delete(`/journal/${item.id}/`).then(load)} className="text-xs text-rose-600">Delete</button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
