import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  member_id: {
    type: String,
    required: true,
    maxlength: 50
  },
  medicine_name: {
    type: String,
    required: true,
    maxlength: 150
  },
  dosage: {
    type: String,
    required: true,
    maxlength: 100
  },
  reason: {
    type: String,
    required: true
  },
  prescribed_by: {
    type: String,
    required: true,
    maxlength: 150
  },
  start_date: {
    type: Date,
    required: true
  },
  prescription_photo: {
    type: String,
    maxlength: 255
  }
}, {
  timestamps: true
});

export default mongoose.model("Medication", medicationSchema);