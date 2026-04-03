import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function PublicLayout({ children, onNavigate, onLanguageChange }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const routerNavigate = useNavigate();
  const [language, setLanguage] = useState(i18n.language || "en");
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languageLabels = {
    en: t("navbar.language.english"),
    si: t("navbar.language.sinhala"),
    ta: t("navbar.language.tamil"),
  };

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    setIsLangOpen(false);
    if (onLanguageChange) onLanguageChange(code);
  };

  const navigate = useMemo(() => {
    if (onNavigate) return onNavigate;

    return (name, params = {}) => {
      switch (name) {
        case "home":
          routerNavigate("/");
          return;
        case "health-centers": {
          const query = (params?.query || "").toString().trim();
          const search = query ? `?query=${encodeURIComponent(query)}` : "";
          routerNavigate(`/health-centers${search}`);
          return;
        }
        case "lab": {
          const labId = params?.labId;
          if (labId) routerNavigate(`/labs/${labId}`);
          return;
        }
        default:
          return;
      }
    };
  }, [onNavigate, routerNavigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-6">
          {/* Left: logo */}
          <button
            type="button"
            onClick={() => navigate("home")}
            className="text-teal-700 font-bold text-lg whitespace-nowrap"
          >
            {t("navbar.brand")}
          </button>

          {/* Center: navigation */}
          <nav className="hidden md:flex flex-1 justify-center gap-6 text-sm text-slate-600">
            <button
              type="button"
              onClick={() => navigate("home")}
              className="hover:text-teal-600"
            >
              {t("navbar.home")}
            </button>
            <button
              type="button"
              onClick={() => navigate("health-centers")}
              className="hover:text-teal-600"
            >
              {t("navbar.healthCenters")}
            </button>
          </nav>

          {/* Right side: Language Selector & User Info / Auth Buttons */}
          <div className="flex items-center gap-4">
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
                  {t("navbar.signIn")}
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-all active:scale-95"
                >
                  {t("navbar.createAccount")}
                </Link>
              </div>
            )}
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
