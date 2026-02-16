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
  free_text: {
    type: String
  },
  voice_recording: {
    type: String,
    maxlength: 255
  }
}, {
  timestamps: true
});

export default mongoose.model("HealthDetails", healthDetailsSchema);