import mongoose from "mongoose";
import TestResult from "../testResult.model.js";

const { Schema } = mongoose;

const hemoglobinResultSchema = new Schema({
  // Primary Result
  hemoglobinLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 25,
    set: (val) => Math.round(val * 10) / 10,
  },

  // Unit
  unit: {
    type: String,
    enum: ["g/dL", "g/L"],
    default: "g/dL",
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
    enum: ["Good", "Hemolyzed", "Clotted", "Insufficient"],
    required: true,
  },

  // Collection Time
  sampleCollectionTime: {
    type: Date,
    required: true,
  },

  // Testing Method
  method: {
    type: String,
    enum: [
      "Hemoglobinometer",
      "Automated Hematology Analyzer",
      "Cyanmethemoglobin Method",
    ],
    required: true,
  },

  // Patient Condition (affects reference range)
  patientCondition: {
    type: String,
    enum: ["Non-pregnant Adult", "Pregnant", "Child", "Infant"],
    required: true,
  },

  // Reference Range (sex and condition-specific)
  referenceRange: {
    normalMin: { type: Number, required: true },
    normalMax: { type: Number, required: true },
    mildAnemiaMin: Number,
    moderateAnemiaMin: Number,
    severeAnemiaMax: Number,
  },

  // Interpretation
  interpretation: {
    type: String,
    enum: [
      "Normal",
      "Mild Anemia",
      "Moderate Anemia",
      "Severe Anemia",
      "Polycythemia",
    ],
    required: true,
  },

  // Clinical Notes
  clinicalNotes: {
    type: String,
    maxlength: 500,
  },
});

const HemoglobinResult = TestResult.discriminator(
  "Hemoglobin",
  hemoglobinResultSchema,
);

export default HemoglobinResult;
