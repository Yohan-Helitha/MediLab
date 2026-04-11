import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  member_id: {
    type: String,
    unique: true,
    maxlength: 50
  },
  household_id: {
    type: String,
    required: false,
    maxlength: 50
  },
  full_name: {
    type: String,
    required: true,
    maxlength: 150
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    maxlength: 100
  },
  address: {
    type: String,
    required: false
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
    required: false
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
    required: false,
    maxlength: 20
  },
  gn_division: {
    type: String,
    required: false,
    maxlength: 100
  },
  district: {
    type: String,
    required: false,
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
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  diseases: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate member ID and update age
memberSchema.pre('save', async function() {
  // Normalize and validate contact number to +94xxxxxxxxx
  if (this.contact_number) {
    let v = String(this.contact_number).trim();
    
    // Remove spaces, parentheses, and dashes
    v = v.replace(/[\s\-()]/g, '');
    
    // If user entered local format starting with 0 (eg. 07XXXXXXXX), convert to +94XXXXXXXXX
    if (/^0\d{9}$/.test(v)) {
      v = `+94${v.slice(1)}`;
    }
    // If user entered 9 digits (eg. 7XXXXXXXX), convert to +94
    else if (/^\d{9}$/.test(v)) {
      v = `+94${v}`;
    }
    // If already in international format, ensure it's correct
    else if (/^\+94\d{9}$/.test(v)) {
      // Keep as is
    } else {
      // Invalid format
      throw new Error('Invalid contact number format. Expected +94xxxxxxxxx or 07xxxxxxxxx');
    }
    
    this.contact_number = v;
  }
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