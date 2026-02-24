import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema({
  member_id: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true,
    maxlength: 150
  },
  relationship: {
    type: String,
    required: true,
    maxlength: 50
  },
  primary_phone: {
    type: String,
    required: true,
    maxlength: 20
  },
  secondary_phone: {
    type: String,
    maxlength: 20
  },
  contact_priority: {
    type: String,
    required: true,
    enum: ["PRIMARY", "SECONDARY"],
    maxlength: 20
  },
  available_24_7: {
    type: Boolean,
    default: false
  },
  best_time_to_contact: {
    type: String,
    maxlength: 20
  },
  address: {
    type: String,
    required: true
  },
  gn_division: {
    type: String,
    required: true,
    maxlength: 100
  },
  landmarks: {
    type: String
  },
  receive_medical_results: {
    type: Boolean,
    default: false
  },
  decision_permission: {
    type: Boolean,
    default: false
  },
  collect_reports_permission: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model("EmergencyContact", emergencyContactSchema);