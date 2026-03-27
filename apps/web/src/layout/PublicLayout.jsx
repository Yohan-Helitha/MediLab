import React from "react";

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-teal-700 font-bold text-lg">MediLab</div>
            <nav className="hidden md:flex gap-4 text-sm text-slate-600">
              <a href="#" className="hover:text-teal-600">Home</a>
              <a href="#" className="hover:text-teal-600">Health Centers</a>
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
