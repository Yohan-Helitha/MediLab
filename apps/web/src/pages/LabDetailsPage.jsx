import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import {
  fetchLabById,
  fetchLabTestsByLab,
  fetchTestInstructionsByDiagnosticTest,
} from "../api/patientApi";
import TestCard from "../components/patient/TestCard";
import { formatHours } from "../utils/format";
import Modal from "../components/Modal";

function LabDetailsPage({ labId, navigate }) {
  const routerNavigate = useNavigate();
  const params = useParams();
  const effectiveLabId = useMemo(() => labId || params.labId, [labId, params.labId]);

  const onNavigate = (name, navParams = {}) => {
    if (navigate) return navigate(name, navParams);

    switch (name) {
      case "home":
        routerNavigate("/");
        return;
      case "health-centers": {
        const query = (navParams?.query || "").toString().trim();
        const search = query ? `?query=${encodeURIComponent(query)}` : "";
        routerNavigate(`/health-centers${search}`);
        return;
      }
      case "lab": {
        const nextLabId = navParams?.labId;
        if (nextLabId) routerNavigate(`/labs/${nextLabId}`);
        return;
      }
      default:
        return;
    }
  };

  const [lab, setLab] = useState(null);
  const [tests, setTests] = useState([]);
  const [instructionsByDiagnosticId, setInstructionsByDiagnosticId] = useState({});
  const [unavailableTest, setUnavailableTest] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!effectiveLabId) return;
        const [labData, labTests] = await Promise.all([
          fetchLabById(effectiveLabId),
          fetchLabTestsByLab(effectiveLabId),
        ]);
        setLab(labData);
        setTests(labTests);

    // Load pre/post instructions for each diagnostic test used in this lab
    const diagnosticIds = Array.from(
      new Set(
        labTests
          .map((t) => t.diagnosticTestId?._id || t.diagnosticTestId)
          .filter(Boolean),
        ),
    );

    if (diagnosticIds.length) {
      const entries = await Promise.all(
        diagnosticIds.map(async (id) => {
          try {
            const data = await fetchTestInstructionsByDiagnosticTest(id);
            const first = Array.isArray(data) ? data[0] : data;
            return [id, first || null];
          } catch (err) {
            console.error(err);
            return [id, null];
          }
        }),
      );
      setInstructionsByDiagnosticId(Object.fromEntries(entries));
    }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [effectiveLabId]);

  const handleBookTest = (labTest) => {
    const status = (labTest.availabilityStatus || "").toUpperCase();
    const isUnavailable = status && status !== "AVAILABLE";

    if (isUnavailable) {
      setUnavailableTest(labTest);
      return;
    }

    routerNavigate("/bookings/new", {
      state: {
        lab,
        labTest,
      },
    });
  };

  if (!lab)
    return (
      <PublicLayout onNavigate={onNavigate}>
        <div>Loading...</div>
      </PublicLayout>
    );

  return (
    <PublicLayout onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-400" />
      <div className="p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{lab.name}</h1>
            <div className="mt-1 inline-flex items-center gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-medium">
                {lab.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-[11px] uppercase tracking-wide">
                {lab.operationalStatus || ""}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-600 md:grid-cols-3">
          <div className="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-teal-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Location
              </div>
              <div>{lab.addressLine1} {lab.addressLine2}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-teal-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 19.72V23a2 2 0 01-2 2h-1C9.82 25 3 18.18 3 10V5z"
              />
            </svg>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Contact
              </div>
              <div>{lab.phoneNumber || "Not provided"}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-teal-600 mt-0.5"
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
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Hours
              </div>
              <div>
                {lab.operatingHours && lab.operatingHours.length
                    ? formatHours(lab.operatingHours)
                  : "Hours not set"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Available Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tests.map((t) => {
              const diagnostic = t.diagnosticTestId || {};
              const instruction =
                instructionsByDiagnosticId[diagnostic._id] || null;

              return (
                <TestCard
                  key={t._id}
                  test={{
                    name: diagnostic.name,
                    category: diagnostic.category,
                    description: diagnostic.description,
                    price: t.price,
                    estimatedResultTimeHours:
                      t.estimatedResultTimeHours,
                  }}
                  availabilityStatus={t.availabilityStatus}
                  preInstructions={
                    instruction?.preTestInstructions || []
                  }
                  postInstructions={
                    instruction?.postTestInstructions || []
                  }
                  onBookTest={() => handleBookTest(t)}
                />
              );
            })}
          </div>
        </section>
      </div>

      <Modal
        isOpen={!!unavailableTest}
        title="Test not available"
        onClose={() => setUnavailableTest(null)}
      >
        <p className="text-sm text-slate-700">
          {unavailableTest?.diagnosticTestId?.name
            ? `${unavailableTest.diagnosticTestId.name} is not currently available. Please check another lab for this test.`
            : "This test is not currently available. Please check another lab for this test."}
        </p>
      </Modal>
    </PublicLayout>
  );
}

export default LabDetailsPage;
