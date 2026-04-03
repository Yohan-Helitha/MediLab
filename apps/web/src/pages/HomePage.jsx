import React, { useEffect, useMemo, useState, useRef } from "react";
import { HiBuildingOffice2, HiBeaker } from "react-icons/hi2";
import PublicLayout from "../layout/PublicLayout";
import SearchBar from "../components/patient/SearchBar";
import CategoryPill from "../components/patient/CategoryPill";
import LabCard from "../components/patient/LabCard";
import TestCard from "../components/patient/TestCard";
import HeroCarousel from "../components/patient/HeroCarousel";
import { fetchLabs, fetchTestTypes } from "../api/patientApi";

function CountUp({ end, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    let animationFrame = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, end, duration]);

  return <span ref={countRef}>{count}</span>;
}

function HomePage({ navigate }) {
  const [labs, setLabs] = useState([]);
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [labsData, testsData] = await Promise.all([fetchLabs(), fetchTestTypes()]);
        setLabs(labsData);
        setTests(testsData);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const map = {};
    tests.forEach((t) => {
      if (!t.category) return;
      map[t.category] = (map[t.category] || 0) + 1;
    });
    return Object.entries(map).map(([k, v]) => ({ category: k, count: v }));
  }, [tests]);

  const popularTests = tests.slice(0, 5);

  const activeCenters = useMemo(
    () => labs.filter((lab) => lab.isActive !== false).length,
    [labs],
  );

  const activeTests = useMemo(
    () => tests.filter((t) => t.isActive !== false).length,
    [tests],
  );

  return (
    <PublicLayout onNavigate={navigate}>
      <div className="space-y-8">
        <section className="rounded-3xl bg-teal-800 shadow-2xl border border-slate-700/30 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[420px]">
            {/* Carousel Side - Smaller Width */}
            <div className="lg:w-2/5 relative overflow-hidden group border-r border-white/5">
              <HeroCarousel />
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-teal-800 via-teal-800/20 to-transparent pointer-events-none hidden lg:block"></div>
            </div>

            {/* Content Side - Larger Width with Search */}
            <div className="lg:w-3/5 p-8 md:p-12 lg:pl-16 flex flex-col justify-center relative bg-gradient-to-br from-teal-800 via-teal-800 to-teal-900/40">
              <div className="relative z-10 w-full max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 bg-teal-900/50 backdrop-blur-sm text-teal-300 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-teal-500/30 shadow-inner">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                  Welcome to rural health diagnostics
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                  Find nearby <span className="text-teal-500  decoration-teal-500/30">health centers</span> and book diagnostic tests.
                </h1>
                
                <p className="mt-4 text-white text-lg leading-relaxed max-w-lg mb-10">
                  Access professional diagnostic services at affordable prices across rural health centers in Sri Lanka.
                </p>

                
              </div>

 
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="rounded-[0.5rem] bg-black border border-black-800 px-12 py-10 shadow-2xl shadow-teal-900/20 relative overflow-hidden">
            {/* Subtle Gradient Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
              <div className="flex flex-col items-center group">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className="text-4xl font-bold tracking-tight text-white">
                    <CountUp end={activeCenters} />
                  </span>
                  <HiBuildingOffice2 className="h-8 w-8 text-teal-200 group-hover:scale-110 group-hover:text-teal-300 transition-all duration-300" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200 group-hover:text-teal-200/70 transition-colors">Active Centers</div>
              </div>

              <div className="flex flex-col items-center group">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className="text-4xl font-bold tracking-tight text-white">
                    <CountUp end={activeTests} />
                    {activeTests > 0 ? "+" : ""}
                  </span>
                  <HiBeaker className="h-8 w-8 text-teal-200 group-hover:scale-110 group-hover:text-teal-300 transition-all duration-300" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200 group-hover:text-teal-200/70 transition-colors">Tests Available</div>
              </div>

              <div className="flex flex-col items-center group">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className="text-4xl font-bold tracking-tight text-white">24/7</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-teal-200 group-hover:rotate-12 group-hover:text-teal-300 transition-all duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200 group-hover:text-teal-200/70 transition-colors">Support Available</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 pt-8 tracking-tight">Browse by Category</h2>
              <p className="text-slate-500 mt-1 font-medium">Explore all available diagnostic test categories.</p>
            </div>
            <div className="h-px flex-1 bg-slate-100 mx-8 mb-3 opacity-50"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((c) => (
              <CategoryPill key={c.category} category={c.category} count={c.count} />
            ))}
            <CategoryPill key="ECG" category="ECG" count={1} />
          </div>
        </section>
          <section className="mt-16">
            <div className="max-w-6xl mx-auto px-6 py-8 bg-teal-800 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="text-center mb-16 relative">
                <h3 className="text-3xl font-bold text-slate-200 tracking-tight mb-3">How It Works</h3>
                <p className="text-slate-200 font-medium">Get your diagnostic tests done in three simple steps.</p>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-teal-500 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting Lines (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px border-t-2 border-dashed border-slate-100 -z-0"></div>

                <div className="text-center group relative z-10">
                  <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-3xl bg-teal-50 text-teal-600 mb-6 shadow-sm transition-all duration-500 group-hover:bg-teal-600 group-hover:text-white group-hover:rotate-6 group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto -mt-10 mb-6 border-4 border-white shadow-sm relative z-20">1</div>
                  <h4 className="font-bold text-xl text-slate-200 mb-3 group-hover:text-teal-200 transition-colors">Find a Health Center</h4>
                  <p className="text-slate-200 leading-relaxed px-4">Browse nearby labs or search by name and location in our verification network.</p>
                </div>

                <div className="text-center group relative z-10">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-3xl bg-teal-50 text-teal-600 mb-6 shadow-sm transition-all duration-500 group-hover:bg-teal-600 group-hover:text-white group-hover:-rotate-6 group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6M9 16h6M9 8h6M7 20h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto -mt-10 mb-6 border-4 border-white shadow-sm relative z-20">2</div>
                  <h4 className="font-bold text-xl text-slate-200 mb-3 group-hover:text-teal-200 transition-colors">Choose Your Test</h4>
                  <p className="text-slate-200 leading-relaxed px-4">View available tests, transparent prices, and necessary preparation instructions.</p>
                </div>

                <div className="text-center group relative z-10">
                  <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-3xl bg-teal-50 text-teal-600 mb-6 shadow-sm transition-all duration-500 group-hover:bg-teal-600 group-hover:text-white group-hover:rotate-6 group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto -mt-10 mb-6 border-4 border-white shadow-sm relative z-20">3</div>
                  <h4 className="font-bold text-xl text-slate-200 mb-3 group-hover:text-teal-200 transition-colors">Book & Visit</h4>
                  <p className="text-slate-200 leading-relaxed px-4">Secure your slot online and visit the center with your digital confirmation.</p>
                </div>
              </div>
            </div>
          </section>

        <section className="mt-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Featured Health Centers</h2>
              <p className="text-slate-500 mt-1 font-medium">Top-rated diagnostic centers near you.</p>
            </div>
            <div className="h-px flex-1 bg-slate-100 mx-8 mb-3 opacity-50"></div>
            <button 
              onClick={() => navigate('/labs')}
              className="mb-1 text-teal-600 font-bold text-sm hover:text-teal-700 transition-colors"
            >
              View All Centers
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {labs.slice(0, 6).length > 0 ? (
              labs.slice(0, 6).map((lab) => (
                <LabCard key={lab._id} lab={lab} onView={(l) => navigate(`/lab/${l._id}`)} />
              ))
            ) : (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-50 animate-pulse border border-slate-100"></div>
              ))
            )}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold pt-8 text-slate-800 tracking-tight">Popular Diagnostic Tests</h2>
              <p className="text-slate-500 mt-1 font-medium">Most frequently booked tests by our members.</p>
            </div>
            <div className="h-px flex-1 bg-slate-100 mx-8 mb-3 opacity-50"></div>
            <button 
              onClick={() => navigate('/tests')}
              className="mb-1 text-teal-600 font-bold text-sm hover:text-teal-700 transition-colors"
            >
              Browse All Tests
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularTests.map((t) => (
              <TestCard key={t._id} test={t} />
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default HomePage;