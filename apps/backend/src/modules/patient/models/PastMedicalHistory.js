import mongoose from "mongoose";

const pastMedicalHistorySchema = new mongoose.Schema({
  member_id: {
    type: String,
    required: true,
    maxlength: 50
  },
  surgeries: {
    type: Boolean,
    default: false
  },
  surgery_location: {
    type: [String],
    default: []
  },
  hospital_admissions: {
    type: String
  },
  serious_injuries: {
    type: String
  },
  genetic_disorders: [String],
  blood_transfusion_history: {
    type: Boolean,
    default: false
  },
  tuberculosis_history: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model("PastMedicalHistory", pastMedicalHistorySchema);