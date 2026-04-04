import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { HiGlobeAlt } from "react-icons/hi2";
import MemberProfileForm from "../components/patient/MemberProfileForm";

const NavDropdown = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group" ref={dropdownRef}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-1 hover:text-teal-700 transition-colors whitespace-nowrap py-2"
      >
        <span>{title}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className="absolute left-0 mt-0 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-2 z-50 transition-all animate-in fade-in slide-in-from-top-2"
          onMouseLeave={() => setIsOpen(false)}
        >
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors font-medium text-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

function PublicLayout({ children, onNavigate, onLanguageChange }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const routerNavigate = useNavigate();
  const [language, setLanguage] = useState(i18n.language || "en");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const userMenuRef = React.useRef(null);
  const langMenuRef = React.useRef(null);
  const timeoutRef = React.useRef(null);
  
  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle auto-close user menu after 2 seconds
  useEffect(() => {
    if (isUserOpen) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsUserOpen(false);
      }, 2000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isUserOpen]);

  // Logic to show profile form modal
  const isPatient = user && (user.role === 'patient' || user.userType === 'patient');
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Update modal state if user changes (e.g. after login)
  useEffect(() => {
    if (user && isPatient && !user.isProfileComplete) {
      setShowProfileForm(true);
    } else {
      setShowProfileForm(false);
    }
  }, [user, isPatient]);

  const handleLogout = () => {
    setIsUserOpen(false);
    logout();
    routerNavigate("/", { replace: true });
    window.location.reload(); // Force reload to show public layout
  };

  const handleProfileUpdated = () => {
    setShowProfileForm(false);
  };

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-6">
          {/* Left: logo */}
          <Link
            to="/"
            className="flex items-center gap-3 text-teal-700 font-bold text-lg whitespace-nowrap group"
            onClick={(e) => {
              e.preventDefault();
              navigate("home");
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors overflow-hidden">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <svg
                style={{ display: "none" }}
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.453-.914l-.547-.547z"
                />
              </svg>
            </div>
            <span className="tracking-tight">MediLab</span>
          </Link>

          {/* Center: navigation */}
          {user ? (
            <nav className="hidden lg:flex flex-1 justify-center gap-8 text-[13px] font-semibold text-slate-600">
              <NavDropdown
                title="Health Profile"
                items={[
                  { label: "User Health Profile", to: "/health-profile" },
                  { label: "User Health Reports", to: "/health-reports" },
                ]}
              />

              <NavDropdown
                title="Appointments"
                items={[
                  { label: "Book an Appointment", to: "/booking" },
                  { label: "Visits & Referrals", to: "/visits-referrals" },
                ]}
              />

              <NavDropdown
                title="Family & Care"
                items={[
                  { label: "Household Management", to: "/household-registration" },
                  { label: "Family Tree", to: "/family-tree" },
                  { label: "Emergency Contact", to: "/emergency-contact" },
                ]}
              />

              <Link
                to="/health-centers"
                className="hover:text-teal-700 transition-colors whitespace-nowrap py-2"
              >
                Health Centers
              </Link>

              <Link
                to="/symptom-checker"
                className="hover:text-teal-700 transition-colors whitespace-nowrap py-2"
              >
                AI Health Check
              </Link>

              <Link
                to="/ai-doctor"
                className="hover:text-teal-700 transition-colors whitespace-nowrap py-2"
              >
                AI Doctor Chat
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex flex-1 justify-center gap-6 text-sm text-slate-600 font-medium">
              {/* Empty center nav when logged out */}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-4">
            {!user && (
              <Link
                to="/health-centers"
                className="hidden md:block text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors mr-1"
              >
                Health Centers
              </Link>
            )}

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center text-slate-600 transition-all active:scale-95 group relative"
              title="Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:text-teal-600 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-white" />
            </button>

            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <HiGlobeAlt className="h-4 w-4 text-teal-600" />
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
                    className="flex w-full px-4 py-2.5 text-left hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage("si")}
                    className="flex w-full px-4 py-2.5 text-left hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  >
                    සිංහල
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage("ta")}
                    className="flex w-full px-4 py-2.5 text-left hover:bg-slate-50 text-slate-700 font-medium transition-colors"
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
                  <span className="text-slate-500 text-xs">{user.email || user.role}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
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

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-6">{children}</main>

      <footer className="mt-20 border-t border-slate-200 bg-gradient-to-r from-teal-50/50 to-teal-600/20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2 text-teal-700 font-bold text-xl mb-4">
                <span>MediLab</span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Revolutionizing healthcare management with digital accessibility and family-centric profiles. Your health, our priority.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-5">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/health-centers"
                    className="text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    Health Centers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/symptom-checker"
                    className="text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    Symptom Checker
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-5">Our Services</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/health-profile"
                    className="text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    User Health Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/household-registration"
                    className="text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    Household Management
                  </Link>
                </li>
                <li>
                  <Link
                    to="/emergency-contact"
                    className="text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    Emergency Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/visits-referrals"
                    className="text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    Visits & Referrals
                  </Link>
                </li>
                <li>
                  <Link
                    to="/family-tree"
                    className="text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    Family Tree
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-5">Contact Us</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-4 group">
                  <div className="w-8 h-8 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-500 group-hover:text-teal-600 transition-colors">
                    support@medilab.lk
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-medium">
              © {new Date().getFullYear()} MediLab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {showProfileForm && isPatient && (
        <MemberProfileForm onProfileUpdated={handleProfileUpdated} />
      )}
    </div>
  );
}

export default PublicLayout;
