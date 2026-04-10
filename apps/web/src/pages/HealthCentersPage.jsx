import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import LabCard from "../components/patient/LabCard";
import SearchBar from "../components/patient/SearchBar";
import Modal from "../components/Modal";
import { fetchLabs, fetchLabTestsByLab } from "../api/patientApi";
import { translateTexts } from "../api/translationApi";
import { useTranslation } from "react-i18next";

function HealthCentersPage({ navigate, initialQuery = "" }) {
  const routerNavigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("query") || "";
  const [labs, setLabs] = useState([]);
  const [labTestsByLab, setLabTestsByLab] = useState({});
  const [search, setSearch] = useState(initialQuery || urlQuery || "");
  const [statusModalLab, setStatusModalLab] = useState(null);
  const { t, i18n } = useTranslation();
  const [labNameTranslations, setLabNameTranslations] = useState({});

  const onNavigate = (name, params = {}) => {
    if (navigate) return navigate(name, params);

    switch (name) {
      case "home":
        routerNavigate("/");
        return;
      case "health-centers": {
        const query = (params?.query || "").toString().trim();
        const searchPart = query ? `?query=${encodeURIComponent(query)}` : "";
        routerNavigate(`/health-centers${searchPart}`);
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
    setSearch(initialQuery || urlQuery || "");
  }, [initialQuery, urlQuery]);

  // Dynamic translation for lab names (patient-facing only)
  useEffect(() => {
    const loadTranslations = async () => {
      // Only translate when language is not English
      const lang = (i18n.language || "en").toLowerCase();
      if (!labs.length || lang === "en") {
        setLabNameTranslations({});
        return;
      }

      try {
        const texts = labs
          .flatMap((lab) => [lab.name, lab.district])
          .filter(Boolean);
        const map = await translateTexts(texts, lang, "en");
        setLabNameTranslations(map);
      } catch {
        // On any error, keep originals
        setLabNameTranslations({});
      }
    };

    loadTranslations();
  }, [labs, i18n.language]);

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

    onNavigate("lab", { labId: lab._id });
  };

  return (
    <PublicLayout onNavigate={onNavigate}>
      <div className="space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("healthCenters.title")}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {t("healthCenters.subtitle")}
            </p>
          </div>
          <div className="w-full max-w-sm">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={t("healthCenters.search.placeholder")}
              size="sm"
              buttonLabel={t("search.button")}
              onSubmit={(value) => setSearch(value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredLabs.map((lab) => (
            <LabCard
              key={lab._id}
              lab={{
                ...lab,
                // Override name with translated version if available
                name: labNameTranslations[lab.name] || lab.name,
                district:
                  labNameTranslations[lab.district] || lab.district,
              }}
              onView={handleViewDetails}
            />
          ))}
        </div>
      </div>

      <Modal
        isOpen={!!statusModalLab}
          title={t("labs.details.labUnavailable.title")}
        onClose={() => setStatusModalLab(null)}
      >
        <p className="text-sm text-slate-700">
            {statusModalLab?.name
              ? t("labs.details.labUnavailable.body.withName", {
                  name: statusModalLab.name,
                })
              : t("labs.details.labUnavailable.body.generic")}
        </p>
      </Modal>
    </PublicLayout>
  );
}

export default HealthCentersPage;