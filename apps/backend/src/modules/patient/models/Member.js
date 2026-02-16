import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  member_id: {
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
  address: {
    type: String,
    required: true
  },
  contact_number: {
    type: String,
    required: true,
    maxlength: 20
  },
  nic: {
    type: String,
    unique: true,
    sparse: true,
    maxlength: 20
  },
  password_hash: {
    type: String,
    required: true,
    maxlength: 255
  },
  date_of_birth: {
    type: Date,
    required: true
  },
  age: {
    type: Number,
    default: function() {
      if (this.date_of_birth) {
        const today = new Date();
        const birthDate = new Date(this.date_of_birth);
        return today.getFullYear() - birthDate.getFullYear() - 
          (today.getMonth() < birthDate.getMonth() || 
           (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
      }
      return 0;
    }
  },
  gender: {
    type: String,
    required: true,
    maxlength: 20
  },
  gn_division: {
    type: String,
    required: true,
    maxlength: 100
  },
  district: {
    type: String,
    required: true,
    maxlength: 100
  },
  photo: {
    type: String,
    maxlength: 255
  },
  disability_status: {
    type: Boolean,
    default: false
  },
  pregnancy_status: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate member ID and update age
memberSchema.pre('save', async function() {
  // Generate custom member ID if it's not already set (for new documents)
  if (!this.member_id) {
    // Find the latest member with the highest code
    const latestMember = await mongoose.model('Member').findOne({
      member_id: { $regex: /^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/ }
    }).sort({ member_id: -1 }).exec();
    
    let nextNumber = 1;
    const currentYear = new Date().getFullYear();
    
    if (latestMember && latestMember.member_id) {
      // Extract the numeric part and increment
      const idParts = latestMember.member_id.split('-');
      if (idParts[3] === currentYear.toString()) {
        const lastNumber = parseInt(idParts[4]);
        nextNumber = lastNumber + 1;
      }
    }
    
    // Format the member ID with leading zeros
    const memberId = `MEM-ANU-PADGNDIV-${currentYear}-${nextNumber.toString().padStart(5, '0')}`;
    this.member_id = memberId;
  }
  
  // Update age based on date of birth
  if (this.date_of_birth) {
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    this.age = today.getFullYear() - birthDate.getFullYear() - 
      (today.getMonth() < birthDate.getMonth() || 
       (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
  }
});

export default mongoose.model("Member", memberSchema);