import mongoose from "mongoose";
import TestResult from "../testResult.model.js";

const { Schema } = mongoose;

const bloodGlucoseResultSchema = new Schema({
  // Glucose Test Sub-Type (renamed from testType to avoid base schema conflict)
  glucoseTestType: {
    type: String,
    enum: ["Fasting", "Random", "Postprandial", "HbA1c"],
    required: true,
  },

  // Primary Result
  glucoseLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 600,
    set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal
  },

  // Unit of Measurement
  unit: {
    type: String,
    enum: ["mg/dL", "mmol/L"],
    default: "mg/dL",
    required: true,
  },

  // Sample Information
  sampleType: {
    type: String,
    enum: ["Venous Blood", "Capillary Blood"],
    required: true,
  },

  sampleQuality: {
    type: String,
    enum: ["Good", "Hemolyzed", "Lipemic", "Clotted"],
    required: true,
  },

  // Collection Details
  sampleCollectionTime: {
    type: Date,
    required: true,
  },

  fastingDuration: {
    type: Number,
    min: 0,
    max: 24,
    required: function () {
      return this.glucoseTestType === "Fasting";
    },
  },

  // Testing Method
  method: {
    type: String,
    enum: ["Glucometer", "Laboratory Analyzer", "POC Device"],
    required: true,
  },

  // Reference Ranges (stored for historical accuracy)
  referenceRange: {
    normalMin: { type: Number, required: true },
    normalMax: { type: Number, required: true },
    preDiabeticMin: Number,
    preDiabeticMax: Number,
    diabeticMin: Number,
  },

  // Interpretation (auto-calculated)
  interpretation: {
    type: String,
    enum: ["Normal", "Hypoglycemia", "Pre-diabetic", "Diabetic", "Critical"],
    required: true,
  },

  // Clinical Notes
  clinicalNotes: {
    type: String,
    maxlength: 500,
  },
});

const BloodGlucoseResult = TestResult.discriminator(
  "BloodGlucose",
  bloodGlucoseResultSchema,
);

export default BloodGlucoseResult;
