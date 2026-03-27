import React, { useState } from "react";

function PublicLayout({ children, onNavigate, onLanguageChange }) {
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
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("home")}
              className="text-teal-700 font-bold text-lg"
            >
              MediLab
            </button>
            <nav className="hidden md:flex gap-4 text-sm text-slate-600">
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
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
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
              <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white shadow-lg border border-slate-200 py-1 text-sm z-20">
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("en")}
                  className="block w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700"
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("si")}
                  className="block w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700"
                >
                  සිංහල
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("ta")}
                  className="block w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700"
                >
                  தமிழ்
                </button>
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
