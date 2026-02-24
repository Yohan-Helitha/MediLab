import mongoose from "mongoose";

const allergySchema = new mongoose.Schema({
  member_id: {
    type: String,
    required: true,
    maxlength: 50
  },
  allergy_type: {
    type: String,
    required: true,
    maxlength: 50
  },
  allergen_name: {
    type: String,
    required: true,
    maxlength: 100
  },
  reaction_type: {
    type: String,
    required: true,
    maxlength: 100
  },
  severity: {
    type: String,
    required: true,
    maxlength: 20
  },
  since_year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  }
}, {
  timestamps: true
});

export default mongoose.model("Allergy", allergySchema);