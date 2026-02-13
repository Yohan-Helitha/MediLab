import mongoose from "mongoose";
import TestResult, { FileSchema } from "../testResult.model.js";

const { Schema } = mongoose;

const xrayResultSchema = new Schema({
  // Uploaded Files (1-5 images)
  uploadedFiles: {
    type: [FileSchema],
    required: true,
    validate: {
      validator: (v) => v.length >= 1 && v.length <= 5,
      message: "Must upload between 1 and 5 X-ray images",
    },
  },

  // X-ray Specifics
  bodyPart: {
    type: String,
    enum: [
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
    ],
    required: true,
  },

  specificLocation: {
    type: String,
    maxlength: 100,
  },

  // Clinical Indication
  clinicalIndication: {
    type: String,
    required: true,
    maxlength: 500,
  },

  // Imaging Parameters
  views: {
    type: [String],
    enum: ["AP", "PA", "Lateral", "Oblique", "Axial"],
    required: true,
  },

  technique: {
    kVp: Number,
    mAs: Number,
    distance: String,
  },

  // Radiologist Findings
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
      "Critical - Immediate Attention Required",
    ],
    required: true,
  },

  // Additional Recommendations
  recommendations: {
    type: String,
    maxlength: 500,
  },

  // Radiologist Information
  radiologistName: {
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

const XRayResult = TestResult.discriminator("XRay", xrayResultSchema);

export default XRayResult;
