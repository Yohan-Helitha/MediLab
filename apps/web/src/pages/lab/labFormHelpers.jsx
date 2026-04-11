/**
 * labFormHelpers.jsx
 *
 * Shared constants, utility functions, helper components, discriminator form
 * components, and buildPayload used by the Lab Technician dashboard pages.
 *
 * NOTE: TestResultsPage.jsx keeps its own inline copies of these — this file
 *       is exclusively for the new /lab/* pages. Do NOT modify the originals
 *       in TestResultsPage.jsx.
 */
import React, { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { uploadResultFile } from "../../api/resultApi";
import { getSafeErrorMessage } from "../../utils/errorHandler";

// ---------------------------------------------------------------------------
// Constants — enums mirroring backend discriminator models
// ---------------------------------------------------------------------------
export const FORM_TYPES = [
  "BloodGlucose",
  "Hemoglobin",
  "BloodPressure",
  "Pregnancy",
];
export const UPLOAD_TYPES = ["XRay", "ECG", "Ultrasound", "AutomatedReport"];

export const XRAY_BODY_PARTS = [
  "Chest",
  "Skull",
  "Spine (Cervical)",
  "Spine (Thoracic)",
  "Spine (Lumbar)",
  "Pelvis",
  "Upper Limb",
  "Lower Limb",
  "Abdomen",
  "Other",
];
export const XRAY_VIEWS = ["AP", "PA", "Lateral", "Oblique", "Axial"];
export const XRAY_INTERPRETATIONS = [
  "Normal",
  "Abnormal - Non-urgent",
  "Abnormal - Urgent",
  "Critical - Immediate Attention Required",
];

export const ECG_TYPES = [
  "Resting 12-Lead",
  "Stress Test",
  "Holter Monitor",
  "6-Lead",
  "3-Lead",
];
export const ECG_RHYTHMS = [
  "Sinus Rhythm",
  "Sinus Tachycardia",
  "Sinus Bradycardia",
  "Atrial Fibrillation",
  "Atrial Flutter",
  "Ventricular Tachycardia",
  "Other Arrhythmia",
  "Irregular",
];
export const ECG_INTERPRETATIONS = [
  "Normal",
  "Abnormal - Non-urgent",
  "Abnormal - Urgent",
  "Critical - Immediate Intervention Required",
];

export const ULTRASOUND_TYPES = [
  "Abdominal",
  "Obstetric",
  "Pelvic",
  "Thyroid",
  "Breast",
  "Cardiac (Echocardiogram)",
  "Vascular (Doppler)",
  "Musculoskeletal",
  "Renal",
  "Other",
];
export const ULTRASOUND_INTERPRETATIONS = [
  "Normal",
  "Abnormal - Non-urgent",
  "Abnormal - Requires Follow-up",
  "Critical - Urgent Attention Required",
];

export const AUTOMATED_CATEGORIES = [
  "Complete Blood Count (CBC)",
  "Comprehensive Metabolic Panel",
  "Lipid Profile",
  "Liver Function Tests",
  "Renal Function Tests",
  "Thyroid Function Tests",
  "Coagulation Panel",
  "Other",
];
export const AUTOMATED_SAMPLE_TYPES = [
  "Whole Blood (EDTA)",
  "Whole Blood (Citrate)",
  "Serum",
  "Plasma",
  "Urine",
  "Other",
];

export const GLUCOSE_TEST_TYPES = [
  "Fasting",
  "Random",
  "Postprandial",
  "HbA1c",
];
export const GLUCOSE_UNITS = ["mg/dL", "mmol/L"];
export const GLUCOSE_INTERPRETATIONS = [
  "Normal",
  "Hypoglycemia",
  "Pre-diabetic",
  "Diabetic",
  "Critical",
];
export const SAMPLE_TYPES_BLOOD = ["Venous Blood", "Capillary Blood"];
export const SAMPLE_QUALITY_BLOOD = ["Good", "Hemolyzed", "Lipemic", "Clotted"];
export const GLUCOSE_METHODS = [
  "Glucometer",
  "Laboratory Analyzer",
  "POC Device",
];

export const HB_UNITS = ["g/dL", "g/L"];
export const HB_SAMPLE_QUALITY = [
  "Good",
  "Hemolyzed",
  "Clotted",
  "Insufficient",
];
export const HB_METHODS = [
  "Hemoglobinometer",
  "Automated Hematology Analyzer",
  "Cyanmethemoglobin Method",
];
export const HB_PATIENT_CONDITIONS = [
  "Non-pregnant Adult",
  "Pregnant",
  "Child",
  "Infant",
];

export const BP_POSITIONS = ["Sitting", "Standing", "Lying Down"];
export const BP_ARMS = ["Left", "Right"];
export const BP_CUFF_SIZES = ["Small Adult", "Adult", "Large Adult", "Thigh"];
export const BP_STATES = [
  "Rested (5+ minutes)",
  "Active",
  "Post-exercise",
  "Stressed",
];
export const BP_METHODS = [
  "Manual Sphygmomanometer",
  "Digital BP Monitor",
  "Automated Monitor",
];

export const PREG_RESULTS = ["Positive", "Negative", "Indeterminate"];
export const PREG_TEST_TYPES = [
  "Urine hCG",
  "Serum hCG (Qualitative)",
  "Serum hCG (Quantitative)",
];
export const PREG_METHODS = [
  "Urine Test Strip",
  "Urine Cassette Test",
  "Serum Immunoassay",
  "ELISA",
];
export const PREG_SAMPLE_TYPES = [
  "Urine (First Morning)",
  "Urine (Random)",
  "Serum",
];
export const PREG_SAMPLE_QUALITY = ["Good", "Dilute", "Hemolyzed"];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
export const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const daysSince = (value) => {
  if (!value) return null;
  const diff = Date.now() - new Date(value).getTime();
  return Math.floor(diff / 86400000);
};

// Returns the current local time as "YYYY-MM-DDTHH:MM" for datetime-local max attribute.
// Works correctly across all timezones including Sri Lanka (UTC+5:30).
const getNowLocalISO = () => {
  const now = new Date();
  // getTimezoneOffset() returns minutes west of UTC (negative for UTC+)
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

// Returns an error message if any datetime field is in the future, otherwise null.
// Checks only the date fields relevant to each discriminator type.
export function validateFormDates(discriminatorType, form) {
  const now = new Date();
  const checkField = (fieldName, label) => {
    const val = form[fieldName];
    if (val && new Date(val) > now) {
      return `${label} cannot be in the future.`;
    }
    return null;
  };
  if (
    discriminatorType === "BloodGlucose" ||
    discriminatorType === "Hemoglobin" ||
    discriminatorType === "Pregnancy"
  ) {
    return checkField("sampleCollectionTime", "Collection Time");
  }
  if (discriminatorType === "BloodPressure") {
    return checkField("measurementTime", "Measurement Time");
  }
  if (discriminatorType === "AutomatedReport") {
    return (
      checkField("sampleCollectionTime", "Collection Time") ||
      checkField("analysisCompletedTime", "Analysis Completed Time")
    );
  }
  // XRay, ECG, Ultrasound have no date fields — nothing to validate
  return null;
}

// ---------------------------------------------------------------------------
// Shared UI components
// ---------------------------------------------------------------------------
export const StatusBadge = ({ status }) => {
  const styles =
    status === "released"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}
    >
      {status}
    </span>
  );
};

export const FieldRow = ({ label, value }) => (
  <div>
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </div>
    <div className="mt-0.5 text-sm text-slate-800">{value ?? "—"}</div>
  </div>
);

// ---------------------------------------------------------------------------
// CSS class constants
// ---------------------------------------------------------------------------
export const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";
export const labelCls =
  "block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1";
export const selectCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";
export const textareaCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none";

// ---------------------------------------------------------------------------
// ResultDetailView — displays result data for any discriminator type
// ---------------------------------------------------------------------------
export function ResultDetailView({ result, onDownloadFile }) {
  if (!result) return null;
  const dt = result.discriminatorType || result.__t || result.testType || "";

  const renderFormFields = () => {
    if (dt === "BloodGlucose") {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FieldRow label="Test Type" value={result.glucoseTestType} />
          <FieldRow
            label="Glucose Level"
            value={`${result.glucoseLevel} ${result.unit || "mg/dL"}`}
          />
          <FieldRow label="Interpretation" value={result.interpretation} />
          <FieldRow label="Method" value={result.method} />
          <FieldRow label="Sample Type" value={result.sampleType} />
          <FieldRow label="Sample Quality" value={result.sampleQuality} />
          <FieldRow
            label="Collection Time"
            value={formatDateTime(result.sampleCollectionTime)}
          />
          {result.fastingDuration != null && (
            <FieldRow
              label="Fasting Duration"
              value={`${result.fastingDuration} hrs`}
            />
          )}
          {result.referenceRange && (
            <FieldRow
              label="Reference Range"
              value={`${result.referenceRange.normalMin}–${result.referenceRange.normalMax} ${result.unit || "mg/dL"}`}
            />
          )}
          {result.clinicalNotes && (
            <div className="col-span-full">
              <FieldRow label="Clinical Notes" value={result.clinicalNotes} />
            </div>
          )}
        </div>
      );
    }
    if (dt === "Hemoglobin") {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FieldRow
            label="Hb Level"
            value={`${result.hemoglobinLevel} ${result.unit || "g/dL"}`}
          />
          <FieldRow label="Interpretation" value={result.interpretation} />
          <FieldRow label="Method" value={result.method} />
          <FieldRow label="Patient Condition" value={result.patientCondition} />
          <FieldRow label="Sample Type" value={result.sampleType} />
          <FieldRow label="Sample Quality" value={result.sampleQuality} />
          <FieldRow
            label="Collection Time"
            value={formatDateTime(result.sampleCollectionTime)}
          />
        </div>
      );
    }
    if (dt === "BloodPressure") {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FieldRow label="Systolic" value={`${result.systolicBP} mmHg`} />
          <FieldRow label="Diastolic" value={`${result.diastolicBP} mmHg`} />
          <FieldRow label="Pulse" value={`${result.pulseRate} bpm`} />
          <FieldRow label="Classification" value={result.classification} />
          <FieldRow label="Position" value={result.patientPosition} />
          <FieldRow label="Arm Used" value={result.armUsed} />
          <FieldRow label="Cuff Size" value={result.cuffSize} />
          <FieldRow label="Patient State" value={result.patientState} />
          <FieldRow label="Method" value={result.method} />
          <FieldRow
            label="Measurement Time"
            value={formatDateTime(result.measurementTime)}
          />
        </div>
      );
    }
    if (dt === "Pregnancy") {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FieldRow label="Result" value={result.result} />
          <FieldRow label="Test Type" value={result.pregnancyTestType} />
          <FieldRow label="Method" value={result.method} />
          <FieldRow label="Sample Type" value={result.sampleType} />
          <FieldRow label="Sample Quality" value={result.sampleQuality} />
          <FieldRow
            label="Collection Time"
            value={formatDateTime(result.sampleCollectionTime)}
          />
          {result.hcgLevel != null && (
            <FieldRow
              label="hCG Level"
              value={`${result.hcgLevel} ${result.hcgUnit || "mIU/mL"}`}
            />
          )}
        </div>
      );
    }
    return null;
  };

  const renderUploadFields = () => {
    const files = result.uploadedFiles || [];
    return (
      <div className="space-y-4">
        {files.length > 0 && (
          <div>
            <div className={labelCls}>Uploaded Files</div>
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onDownloadFile && onDownloadFile(result, i)}
                  className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100"
                >
                  ↓ {f.fileName || `File ${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}
        {dt === "XRay" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FieldRow label="Body Part" value={result.bodyPart} />
            <FieldRow label="Views" value={(result.views || []).join(", ")} />
            <FieldRow label="Interpretation" value={result.interpretation} />
            <FieldRow
              label="Clinical Indication"
              value={result.clinicalIndication}
            />
            <FieldRow label="Findings" value={result.findings} />
            <FieldRow label="Impression" value={result.impression} />
            {result.radiologistName && (
              <FieldRow label="Radiologist" value={result.radiologistName} />
            )}
          </div>
        )}
        {dt === "ECG" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FieldRow label="ECG Type" value={result.ecgType} />
            <FieldRow
              label="Heart Rate"
              value={result.heartRate ? `${result.heartRate} bpm` : "—"}
            />
            <FieldRow label="Rhythm" value={result.rhythm} />
            <FieldRow label="Interpretation" value={result.interpretation} />
            <FieldRow
              label="Clinical Indication"
              value={result.clinicalIndication}
            />
            <FieldRow label="Findings" value={result.findings} />
          </div>
        )}
        {dt === "Ultrasound" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FieldRow label="Study Type" value={result.studyType} />
            <FieldRow label="Interpretation" value={result.interpretation} />
            <FieldRow
              label="Clinical Indication"
              value={result.clinicalIndication}
            />
            <FieldRow label="Findings" value={result.findings} />
            <FieldRow label="Impression" value={result.impression} />
          </div>
        )}
        {dt === "AutomatedReport" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FieldRow label="Test Panel" value={result.testPanelName} />
            <FieldRow label="Category" value={result.testCategory} />
            <FieldRow label="Sample Type" value={result.sampleType} />
            <FieldRow
              label="Collection Time"
              value={formatDateTime(result.sampleCollectionTime)}
            />
            <FieldRow
              label="Analysis Time"
              value={formatDateTime(
                result.analysisTime || result.analysisCompletedTime,
              )}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <FieldRow
          label="Patient"
          value={result.patientProfileId?.full_name || "—"}
        />
        <FieldRow label="Test" value={result.testTypeId?.name || "—"} />
        <FieldRow
          label="Health Centre"
          value={result.healthCenterId?.name || "—"}
        />
        <FieldRow
          label="Status"
          value={<StatusBadge status={result.currentStatus} />}
        />
        <FieldRow
          label="Entered By"
          value={result.enteredBy?.fullName || "—"}
        />
        <FieldRow
          label="Released At"
          value={formatDateTime(result.releasedAt)}
        />
      </div>

      {FORM_TYPES.includes(dt) ? renderFormFields() : renderUploadFields()}

      {result.observations && (
        <div>
          <div className={labelCls}>Observations / Remarks</div>
          <p className="text-sm text-slate-700">{result.observations}</p>
        </div>
      )}

      <div>
        <div className={labelCls}>Hard Copy</div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            Printed:{" "}
            {result.hardCopyCollection?.isPrinted ? (
              <span className="font-semibold text-emerald-600">Yes</span>
            ) : (
              <span className="text-slate-500">No</span>
            )}
          </span>
          <span>
            Collected:{" "}
            {result.hardCopyCollection?.isCollected ? (
              <span className="font-semibold text-emerald-600">Yes</span>
            ) : (
              <span className="text-slate-500">No</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BloodGlucoseForm
// ---------------------------------------------------------------------------
export function BloodGlucoseForm({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Glucose Test Type *</label>
          <select
            className={selectCls}
            value={form.glucoseTestType || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, glucoseTestType: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {GLUCOSE_TEST_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Glucose Level *</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="600"
            className={inputCls}
            value={form.glucoseLevel ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, glucoseLevel: e.target.value }))
            }
            placeholder="0–600"
          />
        </div>
        <div>
          <label className={labelCls}>Unit *</label>
          <select
            className={selectCls}
            value={form.unit || "mg/dL"}
            onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
          >
            {GLUCOSE_UNITS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Interpretation *</label>
          <select
            className={selectCls}
            value={form.interpretation || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, interpretation: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {GLUCOSE_INTERPRETATIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Method *</label>
          <select
            className={selectCls}
            value={form.method || ""}
            onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
          >
            <option value="">Select…</option>
            {GLUCOSE_METHODS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sample Type *</label>
          <select
            className={selectCls}
            value={form.sampleType || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, sampleType: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {SAMPLE_TYPES_BLOOD.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sample Quality *</label>
          <select
            className={selectCls}
            value={form.sampleQuality || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, sampleQuality: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {SAMPLE_QUALITY_BLOOD.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Collection Time *</label>
          <input
            type="datetime-local"
            className={inputCls}
            max={getNowLocalISO()}
            value={form.sampleCollectionTime || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, sampleCollectionTime: e.target.value }))
            }
          />
        </div>
        {form.glucoseTestType === "Fasting" && (
          <div>
            <label className={labelCls}>Fasting Duration (hrs) *</label>
            <input
              type="number"
              min="0"
              max="24"
              className={inputCls}
              value={form.fastingDuration ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, fastingDuration: e.target.value }))
              }
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Ref Range Normal Min *</label>
          <input
            type="number"
            className={inputCls}
            value={form.referenceRangeNormalMin ?? ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                referenceRangeNormalMin: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <label className={labelCls}>Ref Range Normal Max *</label>
          <input
            type="number"
            className={inputCls}
            value={form.referenceRangeNormalMax ?? ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                referenceRangeNormalMax: e.target.value,
              }))
            }
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Clinical Notes</label>
        <textarea
          className={textareaCls}
          rows={2}
          maxLength={500}
          value={form.clinicalNotes || ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, clinicalNotes: e.target.value }))
          }
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HemoglobinForm
// ---------------------------------------------------------------------------
export function HemoglobinForm({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Hemoglobin Level *</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="25"
            className={inputCls}
            value={form.hemoglobinLevel ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, hemoglobinLevel: e.target.value }))
            }
          />
        </div>
        <div>
          <label className={labelCls}>Unit *</label>
          <select
            className={selectCls}
            value={form.unit || "g/dL"}
            onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
          >
            {HB_UNITS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Interpretation *</label>
          <select
            className={selectCls}
            value={form.interpretation || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, interpretation: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {[
              "Normal",
              "Mild Anemia",
              "Moderate Anemia",
              "Severe Anemia",
              "Polycythemia",
            ].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Method *</label>
          <select
            className={selectCls}
            value={form.method || ""}
            onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
          >
            <option value="">Select…</option>
            {HB_METHODS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Patient Condition *</label>
          <select
            className={selectCls}
            value={form.patientCondition || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, patientCondition: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {HB_PATIENT_CONDITIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sample Type *</label>
          <select
            className={selectCls}
            value={form.sampleType || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, sampleType: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {SAMPLE_TYPES_BLOOD.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sample Quality *</label>
          <select
            className={selectCls}
            value={form.sampleQuality || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, sampleQuality: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {HB_SAMPLE_QUALITY.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Collection Time *</label>
          <input
            type="datetime-local"
            className={inputCls}
            max={getNowLocalISO()}
            value={form.sampleCollectionTime || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, sampleCollectionTime: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BloodPressureForm
// ---------------------------------------------------------------------------
export function BloodPressureForm({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Systolic BP (mmHg) *</label>
          <input
            type="number"
            min="60"
            max="300"
            className={inputCls}
            value={form.systolicBP ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, systolicBP: e.target.value }))
            }
          />
        </div>
        <div>
          <label className={labelCls}>Diastolic BP (mmHg) *</label>
          <input
            type="number"
            min="40"
            max="200"
            className={inputCls}
            value={form.diastolicBP ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, diastolicBP: e.target.value }))
            }
          />
        </div>
        <div>
          <label className={labelCls}>Pulse Rate (bpm) *</label>
          <input
            type="number"
            min="30"
            max="250"
            className={inputCls}
            value={form.pulseRate ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, pulseRate: e.target.value }))
            }
          />
        </div>
        <div>
          <label className={labelCls}>Classification *</label>
          <select
            className={selectCls}
            value={form.classification || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, classification: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {[
              "Normal",
              "Elevated",
              "Stage 1 Hypertension",
              "Stage 2 Hypertension",
              "Hypertensive Crisis",
              "Hypotension",
            ].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Patient Position *</label>
          <select
            className={selectCls}
            value={form.patientPosition || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, patientPosition: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {BP_POSITIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Arm Used *</label>
          <select
            className={selectCls}
            value={form.armUsed || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, armUsed: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {BP_ARMS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Cuff Size *</label>
          <select
            className={selectCls}
            value={form.cuffSize || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, cuffSize: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {BP_CUFF_SIZES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Patient State *</label>
          <select
            className={selectCls}
            value={form.patientState || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, patientState: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {BP_STATES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Method *</label>
          <select
            className={selectCls}
            value={form.method || ""}
            onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
          >
            <option value="">Select…</option>
            {BP_METHODS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Measurement Time *</label>
          <input
            type="datetime-local"
            className={inputCls}
            max={getNowLocalISO()}
            value={form.measurementTime || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, measurementTime: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PregnancyForm
// ---------------------------------------------------------------------------
export function PregnancyForm({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Result *</label>
          <select
            className={selectCls}
            value={form.result || ""}
            onChange={(e) => setForm((p) => ({ ...p, result: e.target.value }))}
          >
            <option value="">Select…</option>
            {PREG_RESULTS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Pregnancy Test Type *</label>
          <select
            className={selectCls}
            value={form.pregnancyTestType || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, pregnancyTestType: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {PREG_TEST_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Method *</label>
          <select
            className={selectCls}
            value={form.method || ""}
            onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
          >
            <option value="">Select…</option>
            {PREG_METHODS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sample Type *</label>
          <select
            className={selectCls}
            value={form.sampleType || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, sampleType: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {PREG_SAMPLE_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sample Quality *</label>
          <select
            className={selectCls}
            value={form.sampleQuality || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, sampleQuality: e.target.value }))
            }
          >
            <option value="">Select…</option>
            {PREG_SAMPLE_QUALITY.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Collection Time *</label>
          <input
            type="datetime-local"
            className={inputCls}
            max={getNowLocalISO()}
            value={form.sampleCollectionTime || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, sampleCollectionTime: e.target.value }))
            }
          />
        </div>
        {form.pregnancyTestType === "Serum hCG (Quantitative)" && (
          <>
            <div>
              <label className={labelCls}>hCG Level *</label>
              <input
                type="number"
                min="0"
                className={inputCls}
                value={form.hcgLevel ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hcgLevel: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>hCG Unit</label>
              <select
                className={selectCls}
                value={form.hcgUnit || "mIU/mL"}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hcgUnit: e.target.value }))
                }
              >
                <option value="mIU/mL">mIU/mL</option>
                <option value="IU/L">IU/L</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileUploadForm — handles XRay / ECG / Ultrasound / AutomatedReport
// ---------------------------------------------------------------------------
export function FileUploadForm({ discriminatorType, form, setForm }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const maxFiles =
    { XRay: 5, ECG: 3, Ultrasound: 5, AutomatedReport: 1 }[discriminatorType] ||
    5;
  const uploadedFiles = form.uploadedFiles || [];

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(
        `Maximum ${maxFiles} file(s) allowed for ${discriminatorType}`,
      );
      return;
    }
    if (discriminatorType === "AutomatedReport") {
      const nonPdf = files.find((f) => f.type !== "application/pdf");
      if (nonPdf) {
        toast.error("AutomatedReport requires PDF files only");
        return;
      }
    }
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadResultFile(fd);
        uploaded.push(res.data || res);
      }
      setForm((p) => ({
        ...p,
        uploadedFiles: [...uploadedFiles, ...uploaded],
      }));
      toast.success(`${uploaded.length} file(s) uploaded`);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (idx) => {
    setForm((p) => ({
      ...p,
      uploadedFiles: (p.uploadedFiles || []).filter((_, i) => i !== idx),
    }));
  };

  const toggleView = (view) => {
    const current = form.views || [];
    setForm((p) => ({
      ...p,
      views: current.includes(view)
        ? current.filter((v) => v !== view)
        : [...current, view],
    }));
  };

  return (
    <div className="space-y-5">
      {/* File picker */}
      <div>
        <label className={labelCls}>
          Upload Files ({uploadedFiles.length}/{maxFiles}) *
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={uploading || uploadedFiles.length >= maxFiles}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 disabled:opacity-40"
          >
            {uploading ? "Uploading…" : "+ Add File"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple={discriminatorType !== "AutomatedReport"}
            accept={
              discriminatorType === "AutomatedReport"
                ? ".pdf,application/pdf"
                : "image/*,application/pdf"
            }
            className="hidden"
            onChange={handleFileChange}
          />
          {uploadedFiles.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
            >
              <span className="max-w-[140px] truncate">
                {f.fileName || `File ${i + 1}`}
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-1 text-slate-400 hover:text-rose-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* XRay fields */}
      {discriminatorType === "XRay" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Body Part *</label>
              <select
                className={selectCls}
                value={form.bodyPart || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bodyPart: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {XRAY_BODY_PARTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Interpretation *</label>
              <select
                className={selectCls}
                value={form.interpretation || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, interpretation: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {XRAY_INTERPRETATIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Views * (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {XRAY_VIEWS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleView(v)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    (form.views || []).includes(v)
                      ? "border-teal-500 bg-teal-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Clinical Indication *</label>
            <textarea
              className={textareaCls}
              rows={2}
              value={form.clinicalIndication || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, clinicalIndication: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelCls}>Findings *</label>
            <textarea
              className={textareaCls}
              rows={3}
              value={form.findings || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, findings: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelCls}>Impression *</label>
            <textarea
              className={textareaCls}
              rows={2}
              value={form.impression || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, impression: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelCls}>Radiologist Name</label>
            <input
              className={inputCls}
              value={form.radiologistName || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, radiologistName: e.target.value }))
              }
            />
          </div>
        </div>
      )}

      {/* ECG fields */}
      {discriminatorType === "ECG" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>ECG Type *</label>
              <select
                className={selectCls}
                value={form.ecgType || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ecgType: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {ECG_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Heart Rate (bpm)</label>
              <input
                type="number"
                min="20"
                max="300"
                className={inputCls}
                value={form.heartRate ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, heartRate: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>Rhythm</label>
              <select
                className={selectCls}
                value={form.rhythm || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, rhythm: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {ECG_RHYTHMS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Interpretation *</label>
              <select
                className={selectCls}
                value={form.interpretation || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, interpretation: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {ECG_INTERPRETATIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Clinical Indication *</label>
            <textarea
              className={textareaCls}
              rows={2}
              value={form.clinicalIndication || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, clinicalIndication: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelCls}>Findings *</label>
            <textarea
              className={textareaCls}
              rows={3}
              value={form.findings || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, findings: e.target.value }))
              }
            />
          </div>
        </div>
      )}

      {/* Ultrasound fields */}
      {discriminatorType === "Ultrasound" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Study Type *</label>
              <select
                className={selectCls}
                value={form.studyType || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, studyType: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {ULTRASOUND_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Interpretation *</label>
              <select
                className={selectCls}
                value={form.interpretation || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, interpretation: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {ULTRASOUND_INTERPRETATIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Clinical Indication *</label>
            <textarea
              className={textareaCls}
              rows={2}
              value={form.clinicalIndication || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, clinicalIndication: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelCls}>Findings *</label>
            <textarea
              className={textareaCls}
              rows={3}
              value={form.findings || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, findings: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelCls}>Impression *</label>
            <textarea
              className={textareaCls}
              rows={2}
              value={form.impression || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, impression: e.target.value }))
              }
            />
          </div>
        </div>
      )}

      {/* AutomatedReport fields */}
      {discriminatorType === "AutomatedReport" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Test Panel Name *</label>
              <input
                className={inputCls}
                value={form.testPanelName || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, testPanelName: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>Test Category *</label>
              <select
                className={selectCls}
                value={form.testCategory || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, testCategory: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {AUTOMATED_CATEGORIES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Sample Type *</label>
              <select
                className={selectCls}
                value={form.sampleType || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sampleType: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {AUTOMATED_SAMPLE_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Collection Time *</label>
              <input
                type="datetime-local"
                className={inputCls}
                max={getNowLocalISO()}
                value={form.sampleCollectionTime || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    sampleCollectionTime: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>Analysis Completed Time *</label>
              <input
                type="datetime-local"
                className={inputCls}
                max={getNowLocalISO()}
                value={form.analysisCompletedTime || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    analysisCompletedTime: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Build submit payload from form state + booking/user context
// ---------------------------------------------------------------------------
export function buildPayload(
  discriminatorType,
  form,
  booking,
  staffProfileId,
  healthCenterId,
) {
  const base = {
    bookingId: booking._id,
    patientProfileId: booking.patientProfileId?._id || booking.patientProfileId,
    testTypeId: booking.diagnosticTestId?._id || booking.diagnosticTestId,
    healthCenterId,
    enteredBy: staffProfileId,
    observations: form.observations || "",
  };

  if (UPLOAD_TYPES.includes(discriminatorType)) {
    const extra = {};
    if (discriminatorType === "XRay") {
      extra.bodyPart = form.bodyPart;
      extra.clinicalIndication = form.clinicalIndication;
      extra.views = form.views || [];
      extra.findings = form.findings;
      extra.impression = form.impression;
      extra.interpretation = form.interpretation;
      if (form.radiologistName) extra.radiologistName = form.radiologistName;
    }
    if (discriminatorType === "ECG") {
      extra.ecgType = form.ecgType;
      extra.clinicalIndication = form.clinicalIndication;
      extra.findings = form.findings;
      extra.interpretation = form.interpretation;
      if (form.heartRate) extra.heartRate = Number(form.heartRate);
      if (form.rhythm) extra.rhythm = form.rhythm;
    }
    if (discriminatorType === "Ultrasound") {
      extra.studyType = form.studyType;
      extra.clinicalIndication = form.clinicalIndication;
      extra.findings = form.findings;
      extra.impression = form.impression;
      extra.interpretation = form.interpretation;
    }
    if (discriminatorType === "AutomatedReport") {
      extra.testPanelName = form.testPanelName;
      extra.testCategory = form.testCategory;
      extra.sampleType = form.sampleType;
      extra.sampleCollectionTime = form.sampleCollectionTime;
      extra.analysisCompletedTime = form.analysisCompletedTime;
    }
    return { ...base, uploadedFiles: form.uploadedFiles || [], ...extra };
  }

  // Form-based types
  if (discriminatorType === "BloodGlucose") {
    return {
      ...base,
      glucoseTestType: form.glucoseTestType,
      glucoseLevel: Number(form.glucoseLevel),
      unit: form.unit || "mg/dL",
      sampleType: form.sampleType,
      sampleQuality: form.sampleQuality,
      sampleCollectionTime: form.sampleCollectionTime,
      method: form.method,
      interpretation: form.interpretation,
      referenceRange: {
        normalMin: Number(form.referenceRangeNormalMin || 0),
        normalMax: Number(form.referenceRangeNormalMax || 100),
      },
      ...(form.glucoseTestType === "Fasting" && {
        fastingDuration: Number(form.fastingDuration),
      }),
      ...(form.clinicalNotes && { clinicalNotes: form.clinicalNotes }),
    };
  }
  if (discriminatorType === "Hemoglobin") {
    return {
      ...base,
      hemoglobinLevel: Number(form.hemoglobinLevel),
      unit: form.unit || "g/dL",
      sampleType: form.sampleType,
      sampleQuality: form.sampleQuality,
      sampleCollectionTime: form.sampleCollectionTime,
      method: form.method,
      patientCondition: form.patientCondition,
      interpretation: form.interpretation,
    };
  }
  if (discriminatorType === "BloodPressure") {
    return {
      ...base,
      systolicBP: Number(form.systolicBP),
      diastolicBP: Number(form.diastolicBP),
      pulseRate: Number(form.pulseRate),
      patientPosition: form.patientPosition,
      armUsed: form.armUsed,
      cuffSize: form.cuffSize,
      patientState: form.patientState,
      method: form.method,
      measurementTime: form.measurementTime,
      classification: form.classification,
    };
  }
  if (discriminatorType === "Pregnancy") {
    return {
      ...base,
      result: form.result,
      pregnancyTestType: form.pregnancyTestType,
      method: form.method,
      sampleType: form.sampleType,
      sampleQuality: form.sampleQuality,
      sampleCollectionTime: form.sampleCollectionTime,
      ...(form.pregnancyTestType === "Serum hCG (Quantitative)" && {
        hcgLevel: Number(form.hcgLevel),
        hcgUnit: form.hcgUnit || "mIU/mL",
      }),
    };
  }
  return base;
}
