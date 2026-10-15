import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";

export default function Settings() {
  const { user, refreshProfile, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [regionCode, setRegionCode] = useState(user?.region_code || "IN");
  const [aiConsent, setAiConsent] = useState(user?.ai_external_consent ?? true);
  const [savedMsg, setSavedMsg] = useState("");
  const navigate = useNavigate();

  const saveSettings = async (e) => {
    e.preventDefault();
    await apiClient.patch("/users/me/", {
      display_name: displayName,
      region_code: regionCode,
      ai_external_consent: aiConsent,
    });
    await refreshProfile();
    setSavedMsg("Settings updated.");
  };

  const exportData = async () => {
    const res = await apiClient.get("/users/me/export/");
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindcare-data-export.json";
    a.click();
  };

  const deleteAccount = async () => {
    if (!window.confirm("Permanently delete your account and all journals, moods, and chat sessions?")) return;
    await apiClient.delete("/users/me/");
    logout();
    navigate("/");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile & Privacy Settings</h1>
      <form onSubmit={saveSettings} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1">Display Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-transparent" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Crisis Resource Region</label>
          <select value={regionCode} onChange={(e) => setRegionCode(e.target.value)} className="w-full rounded-xl border p-2.5 text-sm bg-transparent">
            <option value="IN">India (IN)</option>
            <option value="US">United States (US)</option>
            <option value="GLOBAL">Global</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={aiConsent} onChange={(e) => setAiConsent(e.target.checked)} />
          <span>Allow sending chat messages to external OpenAI API when configured (uncheck for strictly local companion mode).</span>
        </label>
        <button type="submit" className="px-5 py-2 rounded-xl bg-sage-600 text-white text-sm">Save Preferences</button>
        {savedMsg && <span className="text-xs text-sage-600 ml-3">{savedMsg}</span>}
      </form>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border space-y-3">
        <h2 className="font-semibold text-sm">Data Portability & Account Deletion</h2>
        <div className="flex gap-3">
          <button type="button" onClick={exportData} className="px-4 py-2 rounded-xl border text-xs font-medium">Export All Data (JSON)</button>
          <button type="button" onClick={deleteAccount} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium">Delete Account Permanently</button>
        </div>
      </div>
    </div>
  );
}
