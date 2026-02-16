import mongoose from "mongoose";

const chronicDiseaseSchema = new mongoose.Schema({
  member_id: {
    type: String,
    required: true,
    maxlength: 50
  },
  disease_name: {
    type: String,
    required: true,
    maxlength: 100
  },
  since_year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  currently_on_medication: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model("ChronicDisease", chronicDiseaseSchema);