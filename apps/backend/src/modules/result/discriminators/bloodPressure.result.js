import mongoose from "mongoose";
import TestResult from "../testResult.model.js";

const { Schema } = mongoose;

const bloodPressureResultSchema = new Schema({
  // Primary Results
  systolicBP: {
    type: Number,
    required: true,
    min: 60,
    max: 300,
  },

  diastolicBP: {
    type: Number,
    required: true,
    min: 40,
    max: 200,
  },

  pulseRate: {
    type: Number,
    required: true,
    min: 30,
    max: 250,
  },

  // Unit
  unit: {
    type: String,
    default: "mmHg",
    required: true,
  },

  // Measurement Context
  patientPosition: {
    type: String,
    enum: ["Sitting", "Standing", "Lying Down"],
    required: true,
  },

  armUsed: {
    type: String,
    enum: ["Left", "Right"],
    required: true,
  },

  cuffSize: {
    type: String,
    enum: ["Small Adult", "Adult", "Large Adult", "Thigh"],
    required: true,
  },

  // Patient State
  patientState: {
    type: String,
    enum: ["Rested (5+ minutes)", "Active", "Post-exercise", "Stressed"],
    required: true,
  },

  // Measurement Time
  measurementTime: {
    type: Date,
    required: true,
  },

  // Method
  method: {
    type: String,
    enum: [
      "Manual Sphygmomanometer",
      "Digital BP Monitor",
      "Automated Monitor",
    ],
    required: true,
  },

  // Multiple Readings (if taken)
  additionalReadings: [
    {
      systolic: Number,
      diastolic: Number,
      pulse: Number,
      timeTaken: Date,
    },
  ],

  // Average (if multiple readings)
  averageReading: {
    systolic: Number,
    diastolic: Number,
    pulse: Number,
  },

  // Reference Ranges
  referenceRange: {
    normalSystolicMax: { type: Number, default: 120 },
    normalDiastolicMax: { type: Number, default: 80 },
    elevatedSystolicMax: { type: Number, default: 129 },
    stage1HypertensionSystolicMax: { type: Number, default: 139 },
    stage1HypertensionDiastolicMax: { type: Number, default: 89 },
  },

  // Interpretation
  interpretation: {
    type: String,
    enum: [
      "Normal",
      "Elevated",
      "Stage 1 Hypertension",
      "Stage 2 Hypertension",
      "Hypertensive Crisis",
      "Hypotension",
    ],
    required: true,
  },

  // Clinical Notes
  clinicalNotes: {
    type: String,
    maxlength: 500,
  },
});

const BloodPressureResult = TestResult.discriminator(
  "BloodPressure",
  bloodPressureResultSchema,
);

export default BloodPressureResult;
