import mongoose from "mongoose";
import TestResult, { FileSchema } from "../testResult.model.js";

const { Schema } = mongoose;

// Custom FileSchema for Ultrasound with imageDescription
const UltrasoundFileSchema = new Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    imageDescription: {
      type: String,
      maxlength: 200,
    },
  },
  { _id: false },
);

const ultrasoundResultSchema = new Schema({
  // Uploaded Files (ultrasound images)
  uploadedFiles: {
    type: [UltrasoundFileSchema],
    required: true,
    validate: {
      validator: (v) => v.length >= 1 && v.length <= 5,
      message: "Must upload between 1 and 5 ultrasound images",
    },
  },

  // Ultrasound Type
  studyType: {
    type: String,
    enum: [
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
    ],
    required: true,
  },

  specificRegion: {
    type: String,
    maxlength: 200,
  },

  // Clinical Indication
  clinicalIndication: {
    type: String,
    required: true,
    maxlength: 500,
  },

  // Technical Details
  transducerType: {
    type: String,
    enum: ["Linear", "Curved", "Sector", "Endocavitary"],
  },

  frequency: {
    type: String,
  },

  // Obstetric-Specific (if applicable)
  obstetricDetails: {
    gestationalAge: {
      weeks: Number,
      days: Number,
    },
    fetalHeartRate: Number,
    estimatedFetalWeight: Number,
    placentalPosition: String,
    amnioticFluidLevel: String,
  },

  // Measurements (flexible for different study types)
  measurements: {
    type: Object,
  },

  // Findings
  findings: {
    type: String,
    required: true,
    maxlength: 2000,
  },

  impression: {
    type: String,
    required: true,
    maxlength: 1000,
  },

  // Interpretation
  interpretation: {
    type: String,
    enum: [
      "Normal",
      "Abnormal - Non-urgent",
      "Abnormal - Requires Follow-up",
      "Critical - Urgent Attention Required",
    ],
    required: true,
  },

  // Recommendations
  recommendations: {
    type: String,
    maxlength: 500,
  },

  // Sonographer/Radiologist Information
  performedBy: {
    type: String,
    maxlength: 200,
  },

  interpretedBy: {
    type: String,
    maxlength: 200,
  },

  radiologistSignature: {
    type: String,
    maxlength: 200,
  },

  reportDate: {
    type: Date,
    default: Date.now,
  },
});

const UltrasoundResult = TestResult.discriminator(
  "Ultrasound",
  ultrasoundResultSchema,
);

export default UltrasoundResult;
