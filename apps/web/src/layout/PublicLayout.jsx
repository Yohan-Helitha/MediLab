import React from "react";

function PublicLayout({ children, onNavigate }) {
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
          <div>
            <button className="rounded-md bg-teal-600 px-4 py-2 text-sm text-white">Book a Test</button>
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
