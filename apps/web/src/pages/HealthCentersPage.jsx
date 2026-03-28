import React, { useEffect, useMemo, useState } from "react";
import PublicLayout from "../layout/PublicLayout";
import LabCard from "../components/patient/LabCard";
import SearchBar from "../components/patient/SearchBar";
import Modal from "../components/Modal";
import { fetchLabs, fetchLabTestsByLab } from "../api/patientApi";

function HealthCentersPage({ navigate, initialQuery = "" }) {
  const [labs, setLabs] = useState([]);
  const [labTestsByLab, setLabTestsByLab] = useState({});
  const [search, setSearch] = useState(initialQuery || "");
  const [statusModalLab, setStatusModalLab] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchLabs();
        // Only show active labs to patients
        const activeLabs = data.filter((lab) => lab.isActive !== false);
        setLabs(activeLabs);

        // Load tests per lab so we can filter by test name
        const entries = await Promise.all(
          activeLabs.map(async (lab) => {
            try {
              const tests = await fetchLabTestsByLab(lab._id);
              return [lab._id, tests];
            } catch (err) {
              console.error(err);
              return [lab._id, []];
            }
          }),
        );
        setLabTestsByLab(Object.fromEntries(entries));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setSearch(initialQuery || "");
  }, [initialQuery]);

  const filteredLabs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return labs;

    return labs.filter((lab) => {
      const matchesLabName = lab.name?.toLowerCase().includes(q);
      const tests = labTestsByLab[lab._id] || [];
      const matchesTestName = tests.some((t) =>
        (t.diagnosticTestId?.name || "").toLowerCase().includes(q),
      );
      return matchesLabName || matchesTestName;
    });
  }, [labs, labTestsByLab, search]);

  const handleViewDetails = (lab) => {
    const status = (lab.operationalStatus || "").toLowerCase();
    const isUnavailable = ["closed", "maintenance", "holiday"].includes(status);

    if (isUnavailable) {
      setStatusModalLab(lab);
      return;
    }

    if (navigate) navigate("lab", { labId: lab._id });
  };

  return (
    <PublicLayout onNavigate={navigate}>
      <div className="space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Health Centers</h1>
            <p className="text-sm text-slate-500 mt-1">
              Find all registred Health Centers in your are area...
            </p>
          </div>
          <div className="w-full max-w-sm">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by lab or test name..."
              size="sm"
              onSubmit={(value) => setSearch(value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredLabs.map((lab) => (
            <LabCard key={lab._id} lab={lab} onView={handleViewDetails} />
          ))}
        </div>
      </div>

      <Modal
        isOpen={!!statusModalLab}
        title="Lab unavailable"
        onClose={() => setStatusModalLab(null)}
      >
        <p className="text-sm text-slate-700">
          {statusModalLab?.name
            ? `${statusModalLab.name} is currently closed. Please look for another lab to book your test.`
            : "This lab is currently closed. Please look for another lab to book your test."}
        </p>
      </Modal>
    </PublicLayout>
  );
}

export default HealthCentersPage;