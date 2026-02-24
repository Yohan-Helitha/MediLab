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
  hospital_admissions: {
    type: String
  },
  serious_injuries: {
    type: String
  },
  genetic_disorders: {
    type: String
  },
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