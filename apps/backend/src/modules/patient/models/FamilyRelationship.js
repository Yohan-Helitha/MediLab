import mongoose from "mongoose";

const familyRelationshipSchema = new mongoose.Schema({
  family_member1_id: {
    type: String,
    required: true,
    ref: "FamilyMember",
    match: /^FAM-ANU-PADGNDIV-\d{5}$/
  },
  family_member2_id: {
    type: String,
    required: true,
    ref: "FamilyMember",
    match: /^FAM-ANU-PADGNDIV-\d{5}$/
  },
  relationship_type: {
    type: String,
    required: true,
    enum: [
      'husband', 'wife', 'father', 'mother', 
      'son', 'daughter', 'brother', 'sister',
      'grandfather', 'grandmother', 'grandson', 'granddaughter'
    ],
    message: 'Invalid relationship type. Must be one of: husband, wife, father, mother, son, daughter, brother, sister, grandfather, grandmother, grandson, granddaughter'
  }
}, {
  timestamps: true
});

export default mongoose.model("FamilyRelationship", familyRelationshipSchema);