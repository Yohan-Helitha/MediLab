import mongoose from "mongoose";

const healthDetailsSchema = new mongoose.Schema({
  member_id: {
    type: String,
    required: true,
    maxlength: 50
  },
  height_cm: {
    type: Number,
    min: 0,
    max: 999.99
  },
  weight_kg: {
    type: Number,
    min: 0,
    max: 999.99
  },
  blood_group: {
    type: String,
    maxlength: 5
  },
  bmi: {
    type: Number,
    min: 0,
    max: 999.99
  },
  pregnancy_status: {
    type: Boolean,
    default: false
  },
  disability_status: {
    type: Boolean,
    default: false
  },
  smoking_status: {
    type: String,
    maxlength: 20
  },
  alcohol_usage: {
    type: String,
    maxlength: 20
  },
  occupation: {
    type: String,
    maxlength: 100
  },
  chemical_exposure: {
    type: Boolean,
    default: false
  },
  family_diabetes: {
    type: Boolean,
    default: false
  },
  family_heart_disease: {
    type: Boolean,
    default: false
  },
  family_genetic_disorders: [String],
  family_no_history: {
    type: Boolean,
    default: true
  },
  free_text: {
    type: String
  },
  voice_recording: {
    type: String,
    maxlength: 255
  },
  lifestyle_history: [{
    id: Number,
    smoking_status: String,
    alcohol_usage: String,
    occupation: String,
    chemical_exposure: Boolean,
    additional_notes: String,
    date: { type: Date, default: Date.now }
  }],
  additional_notes: [{
    id: Number,
    text: String,
    speaker: String,
    date: String
  }],
  voice_notes: [{
    id: Number,
    url: String,
    speaker: String,
    date: String
  }]
}, {
  timestamps: true
});

export default mongoose.model("HealthDetails", healthDetailsSchema);