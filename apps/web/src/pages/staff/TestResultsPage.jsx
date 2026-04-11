import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { fetchLabs } from "../../api/labApi";
import { getBookingById } from "../../api/bookingApi";
import { apiRequest } from "../../api/client";
import {
  getAllNotifications,
  getFailedNotifications,
  getPatientNotifications,
  resendNotification,
} from "../../api/notificationApi";
import {
  downloadResultPDF,
  getResultsByHealthCenter,
  getResultById,
  getStatusHistory,
  getUncollectedReports,
  markAsCollected,
  markAsPrinted,
  softDeleteResult,
  submitTestResult,
  updateResultStatus,
  updateTestResult,
  uploadResultFile,
} from "../../api/resultApi";
import { getSafeErrorMessage } from "../../utils/errorHandler";

// ---------------------------------------------------------------------------
// Constants — enums mirroring backend discriminator models
// ---------------------------------------------------------------------------
const FORM_TYPES = ["BloodGlucose", "Hemoglobin", "BloodPressure", "Pregnancy"];
const UPLOAD_TYPES = ["XRay", "ECG", "Ultrasound", "AutomatedReport"];

const XRAY_BODY_PARTS = [
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
const XRAY_VIEWS = ["AP", "PA", "Lateral", "Oblique", "Axial"];
const XRAY_INTERPRETATIONS = [
  "Normal",
  "Abnormal - Non-urgent",
  "Abnormal - Urgent",
  "Critical - Immediate Attention Required",
];

const ECG_TYPES = [
  "Resting 12-Lead",
  "Stress Test",
  "Holter Monitor",
  "6-Lead",
  "3-Lead",
];
const ECG_RHYTHMS = [
  "Sinus Rhythm",
  "Sinus Tachycardia",
  "Sinus Bradycardia",
  "Atrial Fibrillation",
  "Atrial Flutter",
  "Ventricular Tachycardia",
  "Other Arrhythmia",
  "Irregular",
];
const ECG_INTERPRETATIONS = [
  "Normal",
  "Abnormal - Non-urgent",
  "Abnormal - Urgent",
  "Critical - Immediate Intervention Required",
];

const ULTRASOUND_TYPES = [
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
const ULTRASOUND_INTERPRETATIONS = [
  "Normal",
  "Abnormal - Non-urgent",
  "Abnormal - Requires Follow-up",
  "Critical - Urgent Attention Required",
];

const AUTOMATED_CATEGORIES = [
  "Complete Blood Count (CBC)",
  "Comprehensive Metabolic Panel",
  "Lipid Profile",
  "Liver Function Tests",
  "Renal Function Tests",
  "Thyroid Function Tests",
  "Coagulation Panel",
  "Other",
];
const AUTOMATED_SAMPLE_TYPES = [
  "Whole Blood (EDTA)",
  "Whole Blood (Citrate)",
  "Serum",
  "Plasma",
  "Urine",
  "Other",
];

const GLUCOSE_TEST_TYPES = ["Fasting", "Random", "Postprandial", "HbA1c"];
const GLUCOSE_UNITS = ["mg/dL", "mmol/L"];
const GLUCOSE_INTERPRETATIONS = [
  "Normal",
  "Hypoglycemia",
  "Pre-diabetic",
  "Diabetic",
  "Critical",
];
const SAMPLE_TYPES_BLOOD = ["Venous Blood", "Capillary Blood"];
const SAMPLE_QUALITY_BLOOD = ["Good", "Hemolyzed", "Lipemic", "Clotted"];
const GLUCOSE_METHODS = ["Glucometer", "Laboratory Analyzer", "POC Device"];

const HB_UNITS = ["g/dL", "g/L"];
const HB_SAMPLE_QUALITY = ["Good", "Hemolyzed", "Clotted", "Insufficient"];
const HB_METHODS = [
  "Hemoglobinometer",
  "Automated Hematology Analyzer",
  "Cyanmethemoglobin Method",
];
const HB_PATIENT_CONDITIONS = [
  "Non-pregnant Adult",
  "Pregnant",
  "Child",
  "Infant",
];

const BP_POSITIONS = ["Sitting", "Standing", "Lying Down"];
const BP_ARMS = ["Left", "Right"];
const BP_CUFF_SIZES = ["Small Adult", "Adult", "Large Adult", "Thigh"];
const BP_STATES = [
  "Rested (5+ minutes)",
  "Active",
  "Post-exercise",
  "Stressed",
];
const BP_METHODS = [
  "Manual Sphygmomanometer",
  "Digital BP Monitor",
  "Automated Monitor",
];

const PREG_RESULTS = ["Positive", "Negative", "Indeterminate"];
const PREG_TEST_TYPES = [
  "Urine hCG",
  "Serum hCG (Qualitative)",
  "Serum hCG (Quantitative)",
];
const PREG_METHODS = [
  "Urine Test Strip",
  "Urine Cassette Test",
  "Serum Immunoassay",
  "ELISA",
];
const PREG_SAMPLE_TYPES = ["Urine (First Morning)", "Urine (Random)", "Serum"];
const PREG_SAMPLE_QUALITY = ["Good", "Dilute", "Hemolyzed"];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
};

const formatDateTime = (value) => {
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

const daysSince = (value) => {
  if (!value) return null;
  const diff = Date.now() - new Date(value).getTime();
  return Math.floor(diff / 86400000);
};

const StatusBadge = ({ status }) => {
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

const FieldRow = ({ label, value }) => (
  <div>
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </div>
    <div className="mt-0.5 text-sm text-slate-800">{value ?? "—"}</div>
  </div>
);

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";
const labelCls =
  "block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1";
const selectCls = inputCls;
const textareaCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none";

// ---------------------------------------------------------------------------
// ResultDetailView — displays result data for any discriminator type
// ---------------------------------------------------------------------------
function ResultDetailView({ result }) {
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
                <a
                  key={i}
                  href={f.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100"
                >
                  ↗ {f.fileName || `File ${i + 1}`}
                </a>
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
function BloodGlucoseForm({ form, setForm }) {
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
function HemoglobinForm({ form, setForm }) {
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
function BloodPressureForm({ form, setForm }) {
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
function PregnancyForm({ form, setForm }) {
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
function FileUploadForm({ discriminatorType, form, setForm }) {
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
function buildPayload(
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

// ===========================================================================
// MAIN PAGE COMPONENT
// ===========================================================================
export default function TestResultsPage() {
  const { user } = useAuth();

  // Staff profile ID comes from user.profile._id (HealthOfficer doc)
  const staffProfileId = user?.profile?._id || user?._id || null;
  const staffName = user?.fullName || user?.profile?.fullName || "Staff";

  // -------------------------------------------------------------------------
  // Health centre selection
  // -------------------------------------------------------------------------
  const CENTRE_KEY = "medilab.staffCenterId";
  const CENTRE_NAME_KEY = "medilab.staffCenterName";

  const [labs, setLabs] = useState([]);
  const [selectedCentreId, setSelectedCentreId] = useState(() => {
    try {
      return localStorage.getItem(CENTRE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [selectedCentreName, setSelectedCentreName] = useState(() => {
    try {
      return localStorage.getItem(CENTRE_NAME_KEY) || "";
    } catch {
      return "";
    }
  });
  const [labsLoading, setLabsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLabsLoading(true);
    fetchLabs()
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : data?.labs || [];
          setLabs(list);
        }
      })
      .catch((err) => {
        if (!cancelled) toast.error(getSafeErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLabsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCentreSelect = (id, name) => {
    setSelectedCentreId(id);
    setSelectedCentreName(name);
    try {
      localStorage.setItem(CENTRE_KEY, id);
      localStorage.setItem(CENTRE_NAME_KEY, name);
    } catch {
      /* ignore */
    }
  };

  // -------------------------------------------------------------------------
  // Tab state
  // -------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState("results");

  // -------------------------------------------------------------------------
  // TAB 1: Results list
  // -------------------------------------------------------------------------
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");
  const [searchText, setSearchText] = useState("");

  const loadResults = useCallback(async () => {
    if (!selectedCentreId) return;
    let cancelled = false;
    setResultsLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (startFilter) params.startDate = startFilter;
      if (endFilter) params.endDate = endFilter;
      const data = await getResultsByHealthCenter(selectedCentreId, params);
      if (!cancelled) {
        const list =
          data?.data || data?.results || (Array.isArray(data) ? data : []);
        setResults(list);
      }
    } catch (err) {
      if (!cancelled) toast.error(getSafeErrorMessage(err));
    } finally {
      if (!cancelled) setResultsLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [selectedCentreId, statusFilter, startFilter, endFilter]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const filteredResults = useMemo(() => {
    const term = searchText.toLowerCase();
    return results.filter((r) => {
      if (!term) return true;
      const name = (
        r.patientProfileId?.full_name ||
        r.patientNameSnapshot ||
        ""
      ).toLowerCase();
      const test = (
        r.testTypeId?.name ||
        r.testNameSnapshot ||
        ""
      ).toLowerCase();
      return name.includes(term) || test.includes(term);
    });
  }, [results, searchText]);

  // — View Modal
  const [viewResult, setViewResult] = useState(null);
  const [viewHistory, setViewHistory] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const handleView = async (id) => {
    setViewLoading(true);
    setViewResult(null);
    setViewHistory(null);
    try {
      const [rRes, hRes] = await Promise.all([
        getResultById(id),
        getStatusHistory(id),
      ]);
      setViewResult(rRes?.data || rRes);
      setViewHistory(hRes?.data || hRes?.statusHistory || hRes || []);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setViewLoading(false);
    }
  };

  // — Release
  const [releaseTarget, setReleaseTarget] = useState(null);
  const [releasing, setReleasing] = useState(false);

  const handleRelease = async () => {
    if (!releaseTarget) return;
    setReleasing(true);
    try {
      await updateResultStatus(releaseTarget._id, "released", staffProfileId);
      toast.success("Result released. Patient can now view it.");
      setResults((prev) =>
        prev.map((r) =>
          r._id === releaseTarget._id
            ? {
                ...r,
                currentStatus: "released",
                releasedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
      setReleaseTarget(null);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setReleasing(false);
    }
  };

  // — Mark Printed
  const [printTarget, setPrintTarget] = useState(null);
  const [printing, setPrinting] = useState(false);

  const handleMarkPrinted = async () => {
    if (!printTarget) return;
    setPrinting(true);
    try {
      await markAsPrinted(printTarget._id);
      toast.success("Marked as printed.");
      setResults((prev) =>
        prev.map((r) =>
          r._id === printTarget._id
            ? {
                ...r,
                hardCopyCollection: {
                  ...(r.hardCopyCollection || {}),
                  isPrinted: true,
                  printedAt: new Date().toISOString(),
                },
              }
            : r,
        ),
      );
      setPrintTarget(null);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setPrinting(false);
    }
  };

  // — Mark Collected
  const [collectTarget, setCollectTarget] = useState(null);
  const [collecting, setCollecting] = useState(false);

  const handleMarkCollected = async () => {
    if (!collectTarget) return;
    setCollecting(true);
    try {
      await markAsCollected(collectTarget._id);
      toast.success("Marked as collected.");
      if (collectTarget._fromUncollected) {
        setUncollected((prev) => prev.filter((r) => r._id !== collectTarget._id));
      } else {
        setResults((prev) =>
          prev.map((r) =>
            r._id === collectTarget._id
              ? {
                  ...r,
                  hardCopyCollection: {
                    ...(r.hardCopyCollection || {}),
                    isCollected: true,
                    collectedAt: new Date().toISOString(),
                  },
                }
              : r,
          ),
        );
      }
      setCollectTarget(null);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setCollecting(false);
    }
  };

  // — Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteReason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters.");
      return;
    }
    setDeleting(true);
    try {
      await softDeleteResult(deleteTarget._id, deleteReason.trim());
      toast.success("Result deleted.");
      setResults((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setDeleteTarget(null);
      setDeleteReason("");
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // — Edit Modal (reuses the same discriminator forms)
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = (result) => {
    const dt = result.discriminatorType || result.__t || result.testType || "";
    const prefilled = {
      observations: result.observations || "",
      // Common fields
      uploadedFiles: result.uploadedFiles || [],
      // All possible discriminator fields prefilled
      glucoseTestType: result.glucoseTestType,
      glucoseLevel: result.glucoseLevel,
      unit: result.unit,
      sampleType: result.sampleType,
      sampleQuality: result.sampleQuality,
      sampleCollectionTime: result.sampleCollectionTime
        ? new Date(result.sampleCollectionTime).toISOString().slice(0, 16)
        : "",
      fastingDuration: result.fastingDuration,
      method: result.method,
      interpretation: result.interpretation,
      referenceRangeNormalMin: result.referenceRange?.normalMin,
      referenceRangeNormalMax: result.referenceRange?.normalMax,
      clinicalNotes: result.clinicalNotes,
      hemoglobinLevel: result.hemoglobinLevel,
      patientCondition: result.patientCondition,
      systolicBP: result.systolicBP,
      diastolicBP: result.diastolicBP,
      pulseRate: result.pulseRate,
      patientPosition: result.patientPosition,
      armUsed: result.armUsed,
      cuffSize: result.cuffSize,
      patientState: result.patientState,
      measurementTime: result.measurementTime
        ? new Date(result.measurementTime).toISOString().slice(0, 16)
        : "",
      classification: result.classification,
      result: result.result,
      pregnancyTestType: result.pregnancyTestType,
      hcgLevel: result.hcgLevel,
      hcgUnit: result.hcgUnit,
      bodyPart: result.bodyPart,
      clinicalIndication: result.clinicalIndication,
      views: result.views || [],
      findings: result.findings,
      impression: result.impression,
      radiologistName: result.radiologistName,
      ecgType: result.ecgType,
      heartRate: result.heartRate,
      rhythm: result.rhythm,
      studyType: result.studyType,
      testPanelName: result.testPanelName,
      testCategory: result.testCategory,
      analysisCompletedTime: result.analysisTime
        ? new Date(result.analysisTime).toISOString().slice(0, 16)
        : "",
    };
    setEditForm(prefilled);
    setEditTarget(result);
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    const dt = editTarget.discriminatorType || editTarget.__t || editTarget.testType || "";
    setEditSaving(true);
    try {
      const payload = {
        observations: editForm.observations || "",
        ...buildPayload(
          dt,
          editForm,
          editTarget,
          staffProfileId,
          selectedCentreId,
        ),
      };
      const res = await updateTestResult(editTarget._id, payload);
      const updated = res?.data || res;
      toast.success("Result updated.");
      setResults((prev) =>
        prev.map((r) => (r._id === editTarget._id ? { ...r, ...updated } : r)),
      );
      setEditTarget(null);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // TAB 2: Submit new result
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // TAB 2: Submit new result — pending bookings auto-list
  // -------------------------------------------------------------------------
  const [pendingBookings, setPendingBookings] = useState([]);
  const [pendingBookingsLoading, setPendingBookingsLoading] = useState(false);
  const pendingLoadedCentreRef = useRef("");

  const loadPendingBookings = useCallback(async () => {
    if (!selectedCentreId) return;
    setPendingBookingsLoading(true);
    let cancelled = false;
    try {
      const data = await apiRequest(`/api/bookings/center/${selectedCentreId}`);
      if (cancelled) return;
      const raw =
        data?.bookings?.bookings ||
        data?.bookings ||
        (Array.isArray(data) ? data : []);
      // Only show bookings that don't already have a result (status CONFIRMED / PENDING)
      const pending = raw.filter(
        (b) => b.status !== "COMPLETED" && b.status !== "CANCELLED",
      );
      setPendingBookings(pending);
    } catch (err) {
      if (!cancelled) toast.error(getSafeErrorMessage(err));
    } finally {
      if (!cancelled) setPendingBookingsLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [selectedCentreId]);

  useEffect(() => {
    if (
      activeTab === "submit" &&
      pendingLoadedCentreRef.current !== selectedCentreId
    ) {
      pendingLoadedCentreRef.current = selectedCentreId;
      loadPendingBookings();
    }
  }, [activeTab, selectedCentreId, loadPendingBookings]);

  const handleSelectPendingBooking = (booking) => {
    setBookingIdInput(booking._id);
    setFoundBooking(booking);
  };

  const [bookingIdInput, setBookingIdInput] = useState("");
  const [bookingLookupLoading, setBookingLookupLoading] = useState(false);
  const [foundBooking, setFoundBooking] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1=find, 2=fill
  const [submitForm, setSubmitForm] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleFindBooking = async () => {
    if (!bookingIdInput.trim()) {
      toast.error("Enter a booking ID.");
      return;
    }
    if (!selectedCentreId) {
      toast.error("Select your health centre first.");
      return;
    }
    setBookingLookupLoading(true);
    setFoundBooking(null);
    try {
      const data = await getBookingById(bookingIdInput.trim());
      const booking = data?.booking || data;
      // Verify this booking belongs to the selected centre
      const centreId = booking?.healthCenterId?._id || booking?.healthCenterId;
      if (centreId && centreId.toString() !== selectedCentreId) {
        toast.error("Booking not found at this health centre.");
      } else {
        setFoundBooking(booking);
      }
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setBookingLookupLoading(false);
    }
  };

  const handleUseBooking = () => {
    setSubmitForm({});
    setBookingStep(2);
  };

  const handleSubmitResult = async () => {
    if (!foundBooking) return;
    const discriminatorType = foundBooking.diagnosticTestId?.discriminatorType;
    if (!discriminatorType) {
      toast.error(
        "Could not determine test type. Please contact Arani (TestType configuration).",
      );
      return;
    }
    setSubmitLoading(true);
    try {
      const payload = buildPayload(
        discriminatorType,
        submitForm,
        foundBooking,
        staffProfileId,
        selectedCentreId,
      );
      await submitTestResult(payload);
      toast.success("Result submitted successfully!");
      setBookingIdInput("");
      setFoundBooking(null);
      setBookingStep(1);
      setSubmitForm({});
      setActiveTab("results");
      loadResults();
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // TAB 3: Uncollected
  // -------------------------------------------------------------------------
  const [uncollected, setUncollected] = useState([]);
  const [uncollectedLoading, setUncollectedLoading] = useState(false);
  const [daysThreshold, setDaysThreshold] = useState("1");

  // -------------------------------------------------------------------------
  // TAB 4: Notifications
  // -------------------------------------------------------------------------
  const [notifTab, setNotifTab] = useState("all"); // "all" | "failed" | "history"
  const [failedNotifs, setFailedNotifs] = useState([]);
  const [failedLoading, setFailedLoading] = useState(false);
  const [resendingId, setResendingId] = useState(null);
  // All-notifications sub-tab
  const [allNotifs, setAllNotifs] = useState([]);
  const [allNotifsLoading, setAllNotifsLoading] = useState(false);
  // History needs a patient ID to query — staff can search by patient
  const [notifPatientId, setNotifPatientId] = useState("");
  const [notifHistory, setNotifHistory] = useState([]);
  const [notifHistoryLoading, setNotifHistoryLoading] = useState(false);
  const notifLoadedRef = useRef(false);

  const loadFailedNotifs = useCallback(async () => {
    setFailedLoading(true);
    try {
      const data = await getFailedNotifications({ limit: 50 });
      const list =
        data?.data || data?.notifications || (Array.isArray(data) ? data : []);
      setFailedNotifs(list);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setFailedLoading(false);
    }
  }, []);

  const loadAllNotifs = useCallback(async () => {
    setAllNotifsLoading(true);
    try {
      const data = await getAllNotifications({ limit: 100 });
      const list =
        data?.data || data?.notifications || (Array.isArray(data) ? data : []);
      setAllNotifs(list);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setAllNotifsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "notifications" && !notifLoadedRef.current) {
      notifLoadedRef.current = true;
      loadFailedNotifs();
      loadAllNotifs();
    }
  }, [activeTab, loadFailedNotifs, loadAllNotifs]);

  const handleResend = async (id) => {
    setResendingId(id);
    try {
      await resendNotification(id);
      toast.success("Notification resent successfully.");
      // Remove from failed list and reload all list to reflect updated status
      setFailedNotifs((prev) => prev.filter((n) => n._id !== id));
      setAllNotifs((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: "sent" } : n)),
      );
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setResendingId(null);
    }
  };

  const handleLoadNotifHistory = async () => {
    if (!notifPatientId.trim()) {
      toast.error("Enter a patient profile ID.");
      return;
    }
    setNotifHistoryLoading(true);
    try {
      const data = await getPatientNotifications(notifPatientId.trim(), {
        limit: 50,
      });
      const list =
        data?.data || data?.notifications || (Array.isArray(data) ? data : []);
      setNotifHistory(list);
    } catch (err) {
      toast.error(getSafeErrorMessage(err));
    } finally {
      setNotifHistoryLoading(false);
    }
  };

  const loadUncollected = useCallback(async () => {
    if (!selectedCentreId) return;
    let cancelled = false;
    setUncollectedLoading(true);
    try {
      const data = await getUncollectedReports({
        centerId: selectedCentreId,
        daysThreshold,
      });
      if (!cancelled) {
        const list =
          data?.data || data?.results || (Array.isArray(data) ? data : []);
        setUncollected(list);
      }
    } catch (err) {
      if (!cancelled) toast.error(getSafeErrorMessage(err));
    } finally {
      if (!cancelled) setUncollectedLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [selectedCentreId, daysThreshold]);

  useEffect(() => {
    if (activeTab === "uncollected") loadUncollected();
  }, [activeTab, loadUncollected]);

  const handleMarkCollectedFromUncollected = (r) => {
    setCollectTarget({ ...r, _fromUncollected: true });
  };

  // =========================================================================
  // Render
  // =========================================================================

  // — Centre picker (shown when no centre is selected)
  if (!selectedCentreId) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Test Results</h1>
          <p className="mt-1 text-sm text-slate-500">
            Select your health centre to continue.
          </p>
        </header>

        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Which health centre are you working at?
          </h2>
          {labsLoading && (
            <p className="text-sm text-slate-500">Loading health centres…</p>
          )}
          {!labsLoading && labs.length === 0 && (
            <p className="text-sm text-slate-500">No health centres found.</p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {labs.map((lab) => (
              <button
                key={lab._id}
                type="button"
                onClick={() => handleCentreSelect(lab._id, lab.name)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-left hover:border-teal-300 hover:bg-teal-50 transition-colors"
              >
                <div className="font-semibold text-slate-900 text-sm">
                  {lab.name}
                </div>
                {lab.location && (
                  <div className="mt-0.5 text-xs text-slate-500">
                    {lab.location}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Results</h1>
          <p className="mt-1 text-sm text-slate-500">
            Managing results for{" "}
            <span className="font-semibold text-teal-700">
              {selectedCentreName}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedCentreId("");
            setSelectedCentreName("");
            try {
              localStorage.removeItem(CENTRE_KEY);
              localStorage.removeItem(CENTRE_NAME_KEY);
            } catch {
              /* ignore */
            }
          }}
          className="text-xs text-slate-500 hover:text-slate-700 underline"
        >
          Change centre
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 flex-wrap">
        {[
          { key: "results", label: "Results" },
          { key: "submit", label: "Submit New" },
          { key: "uncollected", label: "Uncollected" },
          { key: "notifications", label: "Notifications" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              activeTab === t.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================================================================
          TAB 1 — Results list
      ================================================================ */}
      {activeTab === "results" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search patient or test…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className={`${inputCls} max-w-xs`}
              />
              <select
                className={`${selectCls} max-w-[160px]`}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                }}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="released">Released</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className={`${inputCls} w-38`}
                  value={startFilter}
                  onChange={(e) => setStartFilter(e.target.value)}
                  placeholder="From"
                />
                <span className="text-slate-400 text-sm">to</span>
                <input
                  type="date"
                  className={`${inputCls} w-38`}
                  value={endFilter}
                  onChange={(e) => setEndFilter(e.target.value)}
                  placeholder="To"
                />
              </div>
              <button
                type="button"
                onClick={loadResults}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
            {resultsLoading && (
              <div className="p-6 text-sm text-slate-500">Loading results…</div>
            )}
            {!resultsLoading && filteredResults.length === 0 && (
              <div className="p-6 text-sm text-slate-500">
                No results found for this health centre.
              </div>
            )}
            {!resultsLoading && filteredResults.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Patient
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Test
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Hard Copy
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.map((r) => {
                      const isPrinted = r.hardCopyCollection?.isPrinted;
                      const isCollected = r.hardCopyCollection?.isCollected;
                      return (
                        <tr
                          key={r._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {r.patientProfileId?.full_name ||
                              r.patientNameSnapshot ||
                              "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {r.testTypeId?.name || r.testNameSnapshot || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {formatDate(r.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={r.currentStatus} />
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {isPrinted ? (
                              <span className="text-emerald-600 font-medium">
                                {isCollected ? "Collected" : "Printed"}
                              </span>
                            ) : (
                              <span>—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleView(r._id)}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(r)}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                              >
                                Edit
                              </button>
                              {r.currentStatus === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => setReleaseTarget(r)}
                                  className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                                >
                                  Release
                                </button>
                              )}
                              {r.currentStatus === "released" && !isPrinted && (
                                <button
                                  type="button"
                                  onClick={() => setPrintTarget(r)}
                                  className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700"
                                >
                                  Mark Printed
                                </button>
                              )}
                              {isPrinted && !isCollected && (
                                <button
                                  type="button"
                                  onClick={() => setCollectTarget(r)}
                                  className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700"
                                >
                                  Mark Collected
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTarget(r);
                                  setDeleteReason("");
                                }}
                                className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          TAB 2 — Submit New
      ================================================================ */}
      {activeTab === "submit" && (
        <div className="space-y-4">
          {/* Header strip — compact, same pattern as Results filter bar */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${bookingStep === 1 ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}
                >
                  1
                </span>
                <span
                  className={`text-sm font-medium ${bookingStep === 1 ? "text-slate-800" : "text-slate-400"}`}
                >
                  Select Booking
                </span>
                <span className="text-slate-300">›</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${bookingStep === 2 ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-400"}`}
                >
                  2
                </span>
                <span
                  className={`text-sm font-medium ${bookingStep === 2 ? "text-slate-800" : "text-slate-400"}`}
                >
                  Enter Results
                  {bookingStep === 2 && foundBooking && (
                    <span className="ml-2 text-xs text-slate-500 font-normal">
                      {foundBooking.patientProfileId?.full_name ||
                        foundBooking.patientNameSnapshot ||
                        ""}
                      {" · "}
                      {foundBooking.diagnosticTestId?.name ||
                        foundBooking.testNameSnapshot ||
                        ""}
                    </span>
                  )}
                </span>
              </div>
              {bookingStep === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setBookingStep(1);
                    setFoundBooking(null);
                    setBookingIdInput("");
                    setSubmitForm({});
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  ← Back to booking selection
                </button>
              )}
            </div>
          </div>

          {bookingStep === 1 && (
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 space-y-5">
                {/* Auto-list of pending bookings */}
                {pendingBookingsLoading && (
                  <p className="text-xs text-slate-400">Loading bookings…</p>
                )}
                {pendingBookings.length > 0 && !foundBooking && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                      Pending Bookings at This Centre
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {pendingBookings.map((b) => (
                        <button
                          key={b._id}
                          type="button"
                          onClick={() => handleSelectPendingBooking(b)}
                          className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-teal-300 hover:bg-teal-50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <span className="text-sm font-semibold text-slate-800">
                                {b.patientProfileId?.full_name ||
                                  b.patientNameSnapshot ||
                                  "—"}
                              </span>
                              <span className="ml-3 text-xs text-slate-500">
                                {b.diagnosticTestId?.name ||
                                  b.testNameSnapshot ||
                                  "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                              <span>{formatDate(b.bookingDate)}</span>
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 font-semibold capitalize">
                                {b.status?.toLowerCase() || "pending"}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Search by Booking ID
                  </p>
                  <div className="flex gap-3 max-w-lg">
                    <input
                      type="text"
                      placeholder="Booking ID (MongoDB ObjectId)"
                      value={bookingIdInput}
                      onChange={(e) => setBookingIdInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleFindBooking();
                      }}
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={handleFindBooking}
                      disabled={bookingLookupLoading}
                      className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                      {bookingLookupLoading ? "Searching…" : "Find"}
                    </button>
                  </div>
                </div>

                {foundBooking && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-teal-800">
                        Booking Found
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setFoundBooking(null);
                          setBookingIdInput("");
                        }}
                        className="text-xs text-slate-400 hover:text-slate-600 underline"
                      >
                        ← Choose different
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-sm">
                      <FieldRow
                        label="Patient"
                        value={
                          foundBooking.patientProfileId?.full_name ||
                          foundBooking.patientNameSnapshot ||
                          "—"
                        }
                      />
                      <FieldRow
                        label="Test"
                        value={
                          foundBooking.diagnosticTestId?.name ||
                          foundBooking.testNameSnapshot ||
                          "—"
                        }
                      />
                      <FieldRow
                        label="Booking Date"
                        value={formatDate(foundBooking.bookingDate)}
                      />
                      <FieldRow label="Type" value={foundBooking.bookingType} />
                      <FieldRow
                        label="Entry Method"
                        value={
                          foundBooking.diagnosticTestId?.entryMethod || "—"
                        }
                      />
                      <FieldRow
                        label="Discriminator"
                        value={
                          foundBooking.diagnosticTestId?.discriminatorType ||
                          "—"
                        }
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleUseBooking}
                        className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                      >
                        Use This Booking →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {bookingStep === 2 && foundBooking && (
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 space-y-5">
              <h2 className="text-base font-semibold text-slate-800">
                Enter Results —{" "}
                {foundBooking.diagnosticTestId?.discriminatorType || ""}
              </h2>

              {/* Patient / context row */}
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm sm:grid-cols-3">
                <FieldRow
                  label="Patient"
                  value={
                    foundBooking.patientProfileId?.full_name ||
                    foundBooking.patientNameSnapshot ||
                    "—"
                  }
                />
                <FieldRow
                  label="Test"
                  value={
                    foundBooking.diagnosticTestId?.name ||
                    foundBooking.testNameSnapshot ||
                    "—"
                  }
                />
                <FieldRow
                  label="Booking Date"
                  value={formatDate(foundBooking.bookingDate)}
                />
                <FieldRow label="Centre" value={selectedCentreName} />
                <FieldRow label="Entered By" value={staffName} />
              </div>

              {/* Discriminator-specific form */}
              {(() => {
                const dt = foundBooking.diagnosticTestId?.discriminatorType;
                if (dt === "BloodGlucose")
                  return (
                    <BloodGlucoseForm
                      form={submitForm}
                      setForm={setSubmitForm}
                    />
                  );
                if (dt === "Hemoglobin")
                  return (
                    <HemoglobinForm form={submitForm} setForm={setSubmitForm} />
                  );
                if (dt === "BloodPressure")
                  return (
                    <BloodPressureForm
                      form={submitForm}
                      setForm={setSubmitForm}
                    />
                  );
                if (dt === "Pregnancy")
                  return (
                    <PregnancyForm form={submitForm} setForm={setSubmitForm} />
                  );
                if (UPLOAD_TYPES.includes(dt))
                  return (
                    <FileUploadForm
                      discriminatorType={dt}
                      form={submitForm}
                      setForm={setSubmitForm}
                    />
                  );
                return (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                    Test type <strong>{dt || "(unknown)"}</strong> does not have
                    a form yet. Please ensure the test type was configured
                    correctly by Arani.
                  </div>
                );
              })()}

              {/* Observations (always present) */}
              <div>
                <label className={labelCls}>Observations / Remarks</label>
                <textarea
                  className={textareaCls}
                  rows={3}
                  maxLength={1000}
                  value={submitForm.observations || ""}
                  onChange={(e) =>
                    setSubmitForm((p) => ({
                      ...p,
                      observations: e.target.value,
                    }))
                  }
                  placeholder="Optional clinical notes…"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBookingStep(1);
                    setFoundBooking(null);
                    setBookingIdInput("");
                    setSubmitForm({});
                  }}
                  className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitResult}
                  disabled={submitLoading}
                  className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {submitLoading ? "Submitting…" : "Submit Result"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          TAB 3 — Uncollected Hard Copies
      ================================================================ */}
      {activeTab === "uncollected" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Reports older than
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  className={`${inputCls} w-20`}
                  value={daysThreshold}
                  onChange={(e) => setDaysThreshold(e.target.value)}
                />
                <span className="text-sm text-slate-600">day(s)</span>
              </div>
              <button
                type="button"
                onClick={loadUncollected}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
            {uncollectedLoading && (
              <div className="p-6 text-sm text-slate-500">Loading…</div>
            )}
            {!uncollectedLoading && uncollected.length === 0 && (
              <div className="p-6 text-sm text-slate-500">
                No uncollected hard copy reports found.
              </div>
            )}
            {!uncollectedLoading && uncollected.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Patient
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Test
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Printed
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Days Waiting
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {uncollected.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {r.patientProfileId?.full_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {r.testTypeId?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {r.patientProfileId?.contact_number || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {formatDate(r.hardCopyCollection?.printedAt)}
                        </td>
                        <td className="px-4 py-3">
                          {r.hardCopyCollection?.printedAt ? (
                            <span
                              className={`font-semibold ${daysSince(r.hardCopyCollection.printedAt) >= 3 ? "text-rose-600" : "text-amber-600"}`}
                            >
                              {daysSince(r.hardCopyCollection.printedAt)} day(s)
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkCollectedFromUncollected(r)
                            }
                            className="rounded-full bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                          >
                            Mark Collected
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          TAB 4 — Notifications
      ================================================================ */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          {/* Header strip — same pattern as Results / Uncollected filter bar */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                {[
                  { key: "all", label: "All" },
                  { key: "failed", label: "Failed" },
                  { key: "history", label: "History" },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setNotifTab(t.key)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                      notifTab === t.key
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {t.label}
                    {t.key === "failed" && failedNotifs.length > 0 && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-700">
                        {failedNotifs.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  notifLoadedRef.current = false;
                  loadFailedNotifs();
                  loadAllNotifs();
                }}
                className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* All notifications */}
          {notifTab === "all" && (
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
              {allNotifsLoading && (
                <div className="p-6 text-sm text-slate-500">
                  Loading notifications…
                </div>
              )}
              {!allNotifsLoading && allNotifs.length === 0 && (
                <div className="p-6 text-sm text-slate-500">
                  No notifications sent yet.
                </div>
              )}
              {!allNotifsLoading && allNotifs.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Type
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Channel
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Recipient
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Sent At
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allNotifs.map((n) => (
                        <tr
                          key={n._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-slate-700 capitalize">
                            {(n.type || "").replace(/_/g, " ")}
                          </td>
                          <td className="px-4 py-3 text-slate-500 capitalize">
                            {n.channel || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {n.recipient || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                n.status === "sent"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {n.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {formatDateTime(n.sentAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {n.status === "failed" && (
                              <button
                                type="button"
                                disabled={resendingId === n._id}
                                onClick={() => handleResend(n._id)}
                                className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                              >
                                {resendingId === n._id ? "Sending…" : "Resend"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Failed notifications */}
          {notifTab === "failed" && (
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
              {failedLoading && (
                <div className="p-6 text-sm text-slate-500">Loading…</div>
              )}
              {!failedLoading && failedNotifs.length === 0 && (
                <div className="p-6">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                    No failed notifications — all deliveries are up to date.
                  </div>
                </div>
              )}
              {!failedLoading && failedNotifs.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Type
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Channel
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Recipient
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Sent At
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Error
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {failedNotifs.map((n) => (
                        <tr
                          key={n._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-slate-700 capitalize">
                            {(n.type || "").replace(/_/g, " ")}
                          </td>
                          <td className="px-4 py-3 text-slate-500 capitalize">
                            {n.channel || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {n.recipient || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {formatDateTime(n.sentAt)}
                          </td>
                          <td
                            className="px-4 py-3 text-xs text-rose-600 max-w-[200px] truncate"
                            title={n.errorMessage}
                          >
                            {n.errorMessage || "Unknown error"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              disabled={resendingId === n._id}
                              onClick={() => handleResend(n._id)}
                              className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                              {resendingId === n._id ? "Sending…" : "Resend"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Notification history (by patient) */}
          {notifTab === "history" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Patient Profile ID (MongoDB ObjectId)"
                    value={notifPatientId}
                    onChange={(e) => setNotifPatientId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLoadNotifHistory();
                    }}
                    className={`${inputCls} max-w-sm`}
                  />
                  <button
                    type="button"
                    onClick={handleLoadNotifHistory}
                    disabled={notifHistoryLoading}
                    className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    {notifHistoryLoading ? "Loading…" : "Search"}
                  </button>
                </div>
              </div>

              {notifHistory.length > 0 && (
                <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left">
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Type
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Channel
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Recipient
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Sent At
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Message
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {notifHistory.map((n) => (
                          <tr
                            key={n._id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-slate-700 capitalize">
                              {(n.type || "").replace(/_/g, " ")}
                            </td>
                            <td className="px-4 py-3 text-slate-500 capitalize">
                              {n.channel || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {n.recipient || "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                  n.status === "sent"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {n.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {formatDateTime(n.sentAt)}
                            </td>
                            <td
                              className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate"
                              title={n.messageContent}
                            >
                              {n.messageContent || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          MODALS
      ================================================================ */}

      {/* View Modal */}
      <Modal
        isOpen={viewResult !== null || viewLoading}
        title="Result Details"
        onClose={() => {
          setViewResult(null);
          setViewHistory(null);
        }}
      >
        {viewLoading ? (
          <p className="py-4 text-sm text-slate-500">Loading…</p>
        ) : (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            <ResultDetailView result={viewResult} />
            {Array.isArray(viewHistory) && viewHistory.length > 0 && (
              <div>
                <div className={labelCls}>Status History</div>
                <div className="space-y-2">
                  {viewHistory.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-xs text-slate-600"
                    >
                      <StatusBadge status={h.status} />
                      <span>{formatDateTime(h.changedAt)}</span>
                      {h.changedBy?.fullName && (
                        <span>by {h.changedBy.fullName}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteTarget !== null}
        title="Delete Result"
        onClose={() => {
          setDeleteTarget(null);
          setDeleteReason("");
        }}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            This will soft-delete the result for{" "}
            <span className="font-semibold">
              {deleteTarget?.patientProfileId?.full_name ||
                deleteTarget?.patientNameSnapshot ||
                "this patient"}
            </span>
            . Results can only be permanently deleted by an Admin.
          </p>
          <div>
            <label className={labelCls}>
              Reason for deletion * (minimum 10 characters)
            </label>
            <textarea
              className={textareaCls}
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Provide a reason…"
            />
            {deleteReason.length > 0 && deleteReason.trim().length < 10 && (
              <p className="mt-1 text-xs text-rose-500">
                {10 - deleteReason.trim().length} more characters needed.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteReason("");
              }}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteReason.trim().length < 10 || deleting}
              onClick={handleDelete}
              className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editTarget !== null}
        title={`Edit Result — ${editTarget?.testTypeId?.name || editTarget?.testNameSnapshot || ""}`}
        onClose={() => setEditTarget(null)}
      >
        {editTarget && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {(() => {
              const dt = editTarget.discriminatorType || editTarget.__t || editTarget.testType || "";
              if (dt === "BloodGlucose")
                return (
                  <BloodGlucoseForm form={editForm} setForm={setEditForm} />
                );
              if (dt === "Hemoglobin")
                return <HemoglobinForm form={editForm} setForm={setEditForm} />;
              if (dt === "BloodPressure")
                return (
                  <BloodPressureForm form={editForm} setForm={setEditForm} />
                );
              if (dt === "Pregnancy")
                return <PregnancyForm form={editForm} setForm={setEditForm} />;
              if (UPLOAD_TYPES.includes(dt))
                return (
                  <FileUploadForm
                    discriminatorType={dt}
                    form={editForm}
                    setForm={setEditForm}
                  />
                );
              return (
                <p className="text-sm text-rose-600">
                  Cannot determine test type for editing.
                </p>
              );
            })()}
            <div>
              <label className={labelCls}>Observations / Remarks</label>
              <textarea
                className={textareaCls}
                rows={3}
                value={editForm.observations || ""}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, observations: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={editSaving}
                className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Release Confirmation Modal */}
      <Modal
        isOpen={releaseTarget !== null}
        title="Release Result to Patient"
        onClose={() => setReleaseTarget(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Release the result for{" "}
            <span className="font-semibold">
              {releaseTarget?.patientProfileId?.full_name ||
                releaseTarget?.patientNameSnapshot ||
                "this patient"}
            </span>{" "}
            (
            <span className="font-semibold">
              {releaseTarget?.testTypeId?.name ||
                releaseTarget?.testNameSnapshot ||
                "test"}
            </span>
            ) to the patient portal? The patient will be able to view and
            download the report.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setReleaseTarget(null)}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={releasing}
              onClick={handleRelease}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
            >
              {releasing ? "Releasing…" : "Release"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Mark Printed Confirmation Modal */}
      <Modal
        isOpen={printTarget !== null}
        title="Mark Hard Copy as Printed"
        onClose={() => setPrintTarget(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Mark the hard copy for{" "}
            <span className="font-semibold">
              {printTarget?.patientProfileId?.full_name ||
                printTarget?.patientNameSnapshot ||
                "this patient"}
            </span>{" "}
            as printed? The patient will be notified to collect their report.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setPrintTarget(null)}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={printing}
              onClick={handleMarkPrinted}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-40"
            >
              {printing ? "Saving…" : "Mark Printed"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Mark Collected Confirmation Modal */}
      <Modal
        isOpen={collectTarget !== null}
        title="Mark Hard Copy as Collected"
        onClose={() => setCollectTarget(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Confirm that{" "}
            <span className="font-semibold">
              {collectTarget?.patientProfileId?.full_name ||
                collectTarget?.patientNameSnapshot ||
                "the patient"}
            </span>{" "}
            has collected their hard copy report?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCollectTarget(null)}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={collecting}
              onClick={handleMarkCollected}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-40"
            >
              {collecting ? "Saving…" : "Mark Collected"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
