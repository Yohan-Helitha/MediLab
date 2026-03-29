import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicLayout({ children, onNavigate, onLanguageChange }) {
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState("en");
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languageLabels = {
    en: "English",
    si: "සිංහල",
    ta: "தமிழ்",
  };

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setIsLangOpen(false);
    if (onLanguageChange) onLanguageChange(code);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-6">
          {/* Left: logo */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("home")}
            className="text-teal-700 font-bold text-lg whitespace-nowrap"
          >
            MediLab
          </button>

          {/* Center: navigation */}
          {onNavigate && (
            <nav className="hidden md:flex flex-1 justify-center gap-6 text-sm text-slate-600">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("home")}
              className="hover:text-teal-600"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("health-centers")}
              className="hover:text-teal-600"
            >
              Health Centers
            </button>
            </nav>
          )}

          {/* Right side: User Info, Login/Signup & Language Selector */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end text-sm leading-tight">
                  <span className="font-semibold text-slate-800">
                    {user.firstName || user.fullName || "User"}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {user.email || user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 shadow-sm transition-all duration-200 hover:bg-rose-100 hover:text-rose-700 active:scale-95"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-all active:scale-95"
                >
                  Create Account
                </Link>
              </div>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <span>{languageLabels[language] || "English"}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-42 rounded-xl bg-white shadow-xl border border-slate-100 py-2 text-sm z-50 animate-in fade-in zoom-in duration-200">
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage("en")}
                    className="flex w-full px-4 py-2-5 text-left hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage("si")}
                    className="flex w-full px-4 py-2-5 text-left hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  >
                    සිංහල
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage("ta")}
                    className="flex w-full px-4 py-2-5 text-left hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  >
                    தமிழ்
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-slate-500">© MediLab</div>
      </footer>
    </div>
  );
}

export default PublicLayout;
