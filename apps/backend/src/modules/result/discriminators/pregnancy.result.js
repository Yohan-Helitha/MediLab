import mongoose from "mongoose";
import TestResult from "../testResult.model.js";

const { Schema } = mongoose;

const pregnancyTestResultSchema = new Schema({
  // Primary Result
  result: {
    type: String,
    enum: ["Positive", "Negative", "Indeterminate"],
    required: true,
  },

  // Pregnancy Test Sub-Type (renamed from testType to avoid base schema conflict)
  pregnancyTestType: {
    type: String,
    enum: ["Urine hCG", "Serum hCG (Qualitative)", "Serum hCG (Quantitative)"],
    required: true,
  },

  // Quantitative Result (for blood tests)
  hcgLevel: {
    type: Number,
    min: 0,
    required: function () {
      return this.pregnancyTestType === "Serum hCG (Quantitative)";
    },
  },

  hcgUnit: {
    type: String,
    enum: ["mIU/mL", "IU/L"],
    default: "mIU/mL",
    required: function () {
      return this.pregnancyTestType === "Serum hCG (Quantitative)";
    },
  },

  // Test Method
  method: {
    type: String,
    enum: [
      "Urine Test Strip",
      "Urine Cassette Test",
      "Serum Immunoassay",
      "ELISA",
    ],
    required: true,
  },

  // Sample Information
  sampleType: {
    type: String,
    enum: ["Urine (First Morning)", "Urine (Random)", "Serum"],
    required: true,
  },

  sampleQuality: {
    type: String,
    enum: ["Good", "Dilute", "Hemolyzed"],
    required: true,
  },

  sampleCollectionTime: {
    type: Date,
    required: true,
  },

  // Test Sensitivity
  sensitivity: {
    type: Number,
    default: 25,
    min: 10,
    max: 100,
  },

  sensitivityUnit: {
    type: String,
    default: "mIU/mL",
  },

  // Clinical Context
  lastMenstrualPeriod: {
    type: Date,
  },

  daysPostLMP: {
    type: Number,
    min: 0,
  },

  // Interpretation
  interpretation: {
    type: String,
    enum: [
      "Pregnant",
      "Not Pregnant",
      "Early Pregnancy Possible",
      "Repeat Test Recommended",
      "Biochemical Pregnancy",
      "Ectopic Pregnancy Suspected",
    ],
    required: true,
  },

  // Recommendations
  recommendations: {
    type: String,
    maxlength: 500,
  },

  // Clinical Notes
  clinicalNotes: {
    type: String,
    maxlength: 500,
  },
});

const PregnancyTestResult = TestResult.discriminator(
  "Pregnancy",
  pregnancyTestResultSchema,
);

export default PregnancyTestResult;
