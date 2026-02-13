import mongoose from "mongoose";
import TestResult from "../testResult.model.js";

const { Schema } = mongoose;

// Custom FileSchema for Automated Reports (PDF only)
const AutomatedReportFileSchema = new Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: {
      type: String,
      required: true,
      enum: ["application/pdf"],
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const automatedReportResultSchema = new Schema({
  // Uploaded Files (machine-generated PDF)
  uploadedFiles: {
    type: [AutomatedReportFileSchema],
    required: true,
    validate: {
      validator: (v) => v.length === 1,
      message: "Must upload exactly 1 automated report file",
    },
  },

  // Test Panel Name
  testPanelName: {
    type: String,
    required: true,
    maxlength: 200,
  },

  // Test Category
  testCategory: {
    type: String,
    enum: [
      "Complete Blood Count (CBC)",
      "Comprehensive Metabolic Panel",
      "Lipid Profile",
      "Liver Function Tests",
      "Renal Function Tests",
      "Thyroid Function Tests",
      "Coagulation Panel",
      "Other",
    ],
    required: true,
  },

  // Machine Information
  analyzerName: {
    type: String,
    maxlength: 200,
  },

  analyzerModel: {
    type: String,
    maxlength: 200,
  },

  // Sample Information
  sampleType: {
    type: String,
    enum: [
      "Whole Blood (EDTA)",
      "Whole Blood (Citrate)",
      "Serum",
      "Plasma",
      "Urine",
      "Other",
    ],
    required: true,
  },

  sampleQuality: {
    type: String,
    enum: ["Acceptable", "Hemolyzed", "Lipemic", "Icteric", "Clotted"],
    required: true,
  },

  sampleCollectionTime: {
    type: Date,
    required: true,
  },

  analysisTime: {
    type: Date,
    required: true,
  },

  // Quality Control Status
  qcStatus: {
    type: String,
    enum: ["Passed", "Failed", "Not Performed"],
    default: "Not Performed",
  },

  // Abnormal Flags (detected by machine)
  abnormalFlags: {
    type: [String],
    default: [],
  },

  criticalValues: {
    type: [String],
    default: [],
  },

  // Overall Interpretation
  interpretation: {
    type: String,
    enum: [
      "All Parameters Normal",
      "Some Abnormalities Detected",
      "Critical Values Present",
      "Review Required",
    ],
    required: true,
  },

  // Reviewed By (Lab Staff)
  reviewedBy: {
    type: String,
    maxlength: 200,
  },

  reviewNotes: {
    type: String,
    maxlength: 1000,
  },

  reportDate: {
    type: Date,
    default: Date.now,
  },
});

const AutomatedReportResult = TestResult.discriminator(
  "AutomatedReport",
  automatedReportResultSchema,
);

export default AutomatedReportResult;
