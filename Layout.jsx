import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { HeartHandshake, LayoutDashboard, MessageCircleHeart, SmilePlus, Wind, BookLock, Settings, PhoneCall, Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout, theme, setTheme } = useAuth();
  const navigate = useNavigate();
  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/chat", label: "AI Companion", icon: MessageCircleHeart },
    { to: "/mood", label: "Mood Tracker", icon: SmilePlus },
    { to: "/meditation", label: "Breathing", icon: Wind },
    { to: "/journal", label: "Private Journal", icon: BookLock },
    { to: "/settings", label: "Settings & Privacy", icon: Settings },
  ];
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-warm-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <aside className="w-full md:w-64 bg-white dark:bg-slate-800 border-b md:border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6 px-2">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-sage-700 dark:text-sage-100">
              <HeartHandshake className="w-6 h-6 text-sage-600" />
              <span>MindCare AI</span>
            </Link>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? "bg-sage-100 dark:bg-slate-700 text-sage-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <Link to="/crisis" className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-200 border border-rose-200 text-xs font-semibold">
            <PhoneCall className="w-4 h-4" /> 24/7 Crisis Support
          </Link>
          <div className="flex items-center justify-between text-xs px-2 pt-1 text-slate-500">
            <span className="truncate">{user?.display_name || user?.username}</span>
            <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-1 hover:text-rose-600">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}
