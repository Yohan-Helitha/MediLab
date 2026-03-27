import React, { useEffect, useState } from "react";
import PublicLayout from "../layout/PublicLayout";
import LabCard from "../components/patient/LabCard";
import { fetchLabs } from "../api/patientApi";

function HealthCentersPage() {
  const [labs, setLabs] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchLabs();
        setLabs(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <PublicLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Featured Health Centers</h1>
          <p className="text-sm text-slate-500 mt-1">Browse nearby labs and view available services.</p>
        </header>
        <div className="grid grid-cols-3 gap-6">
          {labs.map((lab) => (
            <LabCard key={lab._id} lab={lab} onView={() => {}} />
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

export default HealthCentersPage;