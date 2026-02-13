import mongoose from "mongoose";
import TestResult, { FileSchema } from "../testResult.model.js";

const { Schema } = mongoose;

const ecgResultSchema = new Schema({
  // Uploaded Files (ECG printout or digital file)
  uploadedFiles: {
    type: [FileSchema],
    required: true,
    validate: {
      validator: (v) => v.length >= 1 && v.length <= 3,
      message: "Must upload between 1 and 3 ECG files",
    },
  },

  // ECG Type
  ecgType: {
    type: String,
    enum: [
      "Resting 12-Lead",
      "Stress Test",
      "Holter Monitor",
      "6-Lead",
      "3-Lead",
    ],
    required: true,
  },

  // Clinical Indication
  clinicalIndication: {
    type: String,
    required: true,
    maxlength: 500,
  },

  // ECG Parameters (if manually entered)
  heartRate: {
    type: Number,
    min: 20,
    max: 300,
  },

  rhythm: {
    type: String,
    enum: [
      "Sinus Rhythm",
      "Sinus Tachycardia",
      "Sinus Bradycardia",
      "Atrial Fibrillation",
      "Atrial Flutter",
      "Ventricular Tachycardia",
      "Other Arrhythmia",
      "Irregular",
    ],
  },

  prInterval: {
    type: Number,
    min: 0,
    max: 500,
  },

  qrsDuration: {
    type: Number,
    min: 0,
    max: 300,
  },

  qtInterval: {
    type: Number,
    min: 0,
    max: 800,
  },

  qtcInterval: {
    type: Number,
    min: 0,
    max: 800,
  },

  axis: {
    type: String,
    enum: [
      "Normal",
      "Left Axis Deviation",
      "Right Axis Deviation",
      "Indeterminate",
    ],
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
      "Abnormal - Urgent",
      "Critical - Immediate Intervention Required",
    ],
    required: true,
  },

  // Recommendations
  recommendations: {
    type: String,
    maxlength: 500,
  },

  // Physician Information
  interpretedBy: {
    type: String,
    maxlength: 200,
  },

  physicianSignature: {
    type: String,
    maxlength: 200,
  },

  reportDate: {
    type: Date,
    default: Date.now,
  },
});

const ECGResult = TestResult.discriminator("ECG", ecgResultSchema);

export default ECGResult;
