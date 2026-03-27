import React, { useEffect, useState } from "react";
import PublicLayout from "../layout/PublicLayout";
import { fetchLabById, fetchLabTestsByLab } from "../api/patientApi";
import TestCard from "../components/patient/TestCard";

function LabDetailsPage({ labId }) {
  const [lab, setLab] = useState(null);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!labId) return;
        const [labData, labTests] = await Promise.all([
          fetchLabById(labId),
          fetchLabTestsByLab(labId),
        ]);
        setLab(labData);
        setTests(labTests);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [labId]);

  if (!lab) return <PublicLayout><div>Loading...</div></PublicLayout>;

  return (
    <PublicLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{lab.name}</h1>
          <div className="text-sm text-slate-500 mt-2">{lab.addressLine1} {lab.addressLine2}</div>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Available Tests</h2>
          <div className="grid grid-cols-3 gap-6">
            {tests.map((t) => (
              <TestCard key={t._id} test={{
                name: t.diagnosticTestId?.name,
                category: t.diagnosticTestId?.category,
                description: t.diagnosticTestId?.description,
                price: t.price,
                estimatedResultTimeHours: t.estimatedResultTimeHours,
              }} />
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default LabDetailsPage;
