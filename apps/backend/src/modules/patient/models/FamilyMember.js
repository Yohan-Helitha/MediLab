import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema({
  household_id: {
    type: String,
    required: true,
    maxlength: 50
  },
  full_name: {
    type: String,
    required: true,
    maxlength: 150
  },
  gender: {
    type: String,
    required: true,
    maxlength: 20
  },
  date_of_birth: {
    type: Date,
    required: true
  },
  relationship_to_head: {
    type: String,
    required: true,
    maxlength: 50
  }
}, {
  timestamps: true
});

export default mongoose.model("FamilyMember", familyMemberSchema);