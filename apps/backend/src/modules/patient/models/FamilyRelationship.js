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
      'husband', 'wife', 'spouse', 'father', 'mother', 'parent',
      'son', 'daughter', 'child', 'brother', 'sister', 'sibling',
      'grandfather', 'grandmother', 'grandparent', 'grandson', 'granddaughter', 'grandchild',
      'mother-in-law', 'father-in-law', 'son-in-law', 'daughter-in-law', 'child-in-law',
      'grandson-in-law', 'granddaughter-in-law',
      'aunt', 'uncle', 'niece', 'nephew', 'great-grandchild', 'guardian', 'other'
    ],
    message: 'Invalid relationship type. Must be one of valid family relationship values.'
  }
}, {
  timestamps: true
});

export default mongoose.model("FamilyRelationship", familyRelationshipSchema);