import React, { useEffect, useMemo, useState } from "react";
import { HiBuildingOffice2, HiBeaker } from "react-icons/hi2";
import PublicLayout from "../layout/PublicLayout";
import SearchBar from "../components/patient/SearchBar";
import CategoryPill from "../components/patient/CategoryPill";
import LabCard from "../components/patient/LabCard";
import TestCard from "../components/patient/TestCard";
import { fetchLabs, fetchTestTypes } from "../api/patientApi";

function HomePage() {
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
    <PublicLayout>
      <div className="space-y-8">
        <section className="rounded-2xl bg-gradient-to-r from-teal-500 to-teal-800 p-8 text-white shadow-md">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-3 bg-white/10 text-white px-3 py-1 rounded-full text-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h.01M15 12h.01M12 12c0 3.866-3.582 7-8 7" />
                </svg>
                <span>Welcome to Rural Health Diagnostics</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Find nearby health centers and book diagnostic tests easily.</h1>
              <p className="mt-3 text-slate-100 max-w-lg">Access quality diagnostic services at affordable prices across rural health centers in Sri Lanka.</p>
            </div>

            <div className="flex justify-end">
              <div className="w-full md:w-[480px]">
                <SearchBar value={search} onChange={setSearch} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-4 gap-6">
            {categories.map((c) => (
              <CategoryPill key={c.category} category={c.category} count={c.count} />
            ))}
            <CategoryPill key="ECG" category="ECG" count={1} />
          </div>
        </section>
          <section className="mt-8">
            <div className="max-w-6xl mx-auto bg-white rounded-xl p-8 border border-slate-200 shadow-md">
              <h3 className="text-center text-lg font-semibold mb-6">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div className="text-center">
                    <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white mb-3 shadow-sm z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="font-semibold">Find a Health Center</div>
                    <div className="text-sm text-slate-500 mt-2">Browse nearby labs or search by name and location.</div>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white mb-3 shadow-sm z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6M9 16h6M9 8h6M7 20h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="font-semibold">Choose Your Test</div>
                    <div className="text-sm text-slate-500 mt-2">View available tests, prices, and preparation instructions.</div>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white mb-3 shadow-sm z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m1 8H6a2 2 0 01-2-2V7a2 2 0 012-2h7l5 5v8a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="font-semibold">Book & Visit</div>
                    <div className="text-sm text-slate-500 mt-2">Book your test online and visit the lab at your convenience.</div>
                  </div>
              </div>
            </div>
          </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Featured Health Centers</h2>
          <div className="grid grid-cols-4 gap-6">
            {labs.slice(0, 4).map((lab) => (
              <LabCard key={lab._id} lab={lab} onView={() => {}} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Popular Diagnostic Tests</h2>
          <div className="grid grid-cols-3 gap-6">
            {popularTests.map((t) => (
              <TestCard key={t._id} test={t} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="rounded-2xl bg-[#020617] text-white px-8 py-6">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-semibold">{activeCenters}</span>
                  <HiBuildingOffice2 className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="mt-1 text-xs uppercase tracking-wide text-slate-300">Active Centers</div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-semibold">
                    {activeTests}
                    {activeTests > 0 ? "+" : ""}
                  </span>
                  <HiBeaker className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="mt-1 text-xs uppercase tracking-wide text-slate-300">Tests Available</div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-semibold">24/7</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-emerald-400"
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
                <div className="mt-1 text-xs uppercase tracking-wide text-slate-300">Support Available</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default HomePage;