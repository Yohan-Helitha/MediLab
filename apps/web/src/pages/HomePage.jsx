import React, { useEffect, useMemo, useState } from "react";
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

  return (
    <PublicLayout>
      <div className="space-y-8">
        <section className="rounded-2xl bg-teal-700 p-8 text-white">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold">Find nearby health centers and book diagnostic tests easily.</h1>
            <p className="mt-3 text-slate-100">Access quality diagnostic services at affordable prices across rural health centers.</p>
          </div>
          <div className="mt-6 max-w-2xl">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((c) => (
              <CategoryPill key={c.category} category={c.category} count={c.count} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Featured Health Centers</h2>
          <div className="grid grid-cols-4 gap-6">
            {labs.slice(0, 4).map((lab) => (
              <LabCard key={lab._id} lab={lab} onView={() => {}} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Popular Diagnostic Tests</h2>
          <div className="grid grid-cols-3 gap-6">
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