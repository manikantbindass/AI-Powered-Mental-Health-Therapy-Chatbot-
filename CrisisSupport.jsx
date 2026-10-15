import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

export default function CrisisSupport() {
  const [region, setRegion] = useState("IN");
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient.get(`/crisis-resources/?region=${region}`).then((res) => setData(res.data));
  }, [region]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
        <h1 className="text-xl font-bold">24/7 Crisis & Emergency Resources</h1>
        <p className="text-xs">If you are in immediate physical danger, call your local emergency services ({data?.selected?.emergency_number || "112"}) right away.</p>
      </div>
      <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-xl border p-2 text-sm">
        <option value="IN">India</option>
        <option value="US">United States</option>
        <option value="GLOBAL">International</option>
      </select>
      <div className="space-y-3">
        {data?.selected?.helplines?.map((h) => (
          <div key={h.name} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border">
            <div className="font-semibold text-sm">{h.name}</div>
            <div className="text-base font-bold text-sage-700 mt-1">{h.phone}</div>
            <div className="text-xs text-slate-500">{h.hours} — {h.url}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
