import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema({
  family_member_id: {
    type: String,
    unique: true,
    maxlength: 50
  },
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
  isHead: {
    type: Boolean,
    default: false
  },
  spouse_name: {
    type: String,
    default: ""
  },
  parent_name: {
    type: String,
    default: ""
  },
  diseases: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate family member ID
familyMemberSchema.pre('save', async function() {
  // Generate custom family member ID if it's not already set (for new documents)
  if (!this.family_member_id && this.isNew) {
    // Find the latest family member with the highest code
    const latestFamilyMember = await mongoose.model('FamilyMember').findOne({
      family_member_id: { $regex: /^FAM-ANU-PADGNDIV-\d{5}$/ }
    }).sort({ family_member_id: -1 }).exec();
    
    let nextNumber = 1;
    
    if (latestFamilyMember && latestFamilyMember.family_member_id) {
      // Extract the numeric part and increment
      const idParts = latestFamilyMember.family_member_id.split('-');
      const lastNumber = parseInt(idParts[3]);
      nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }
    
    // Format the family member ID with leading zeros
    this.family_member_id = `FAM-ANU-PADGNDIV-${String(nextNumber).padStart(5, '0')}`;
  }
});

export default mongoose.model("FamilyMember", familyMemberSchema);