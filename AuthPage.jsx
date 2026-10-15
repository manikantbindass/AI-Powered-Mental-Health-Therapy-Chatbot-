import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ username, email, password, display_name: displayName, region_code: "IN" });
      } else {
        await login(username, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Check your credentials or password length (min 8 chars).");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5">
        <h1 className="text-2xl font-bold text-center">{isRegister ? "Create Your MindCare Account" : "Welcome Back"}</h1>
        {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border p-3 text-sm bg-transparent" />
          {isRegister && (
            <>
              <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border p-3 text-sm bg-transparent" />
              <input type="text" placeholder="Preferred display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-xl border p-3 text-sm bg-transparent" />
            </>
          )}
          <input type="password" required minLength={8} placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border p-3 text-sm bg-transparent" />
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-sage-600 text-white font-medium text-sm hover:bg-sage-700">
            {submitting ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>
        <button type="button" onClick={() => setIsRegister(!isRegister)} className="w-full text-xs text-center text-sage-600 underline">
          {isRegister ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}
