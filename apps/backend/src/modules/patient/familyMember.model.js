import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema(
  {
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    age: {
      type: Number
    },

    relationshipToHead: {
      type: String,
      enum: ['MOTHER', 'FATHER', 'SPOUSE', 'SON', 'DAUGHTER', 'SIBLING', 'GRANDPARENT', 'GRANDCHILD', 'OTHER'],
      required: true
    },

    isPrimaryPatient: {
      type: Boolean,
      default: false
    },
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientProfile'
    }
  },
  {
    timestamps: true
  }
);

// Calculate age before saving
familyMemberSchema.pre('save', function (next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }
  next();
});

// Indexes
familyMemberSchema.index({ householdId: 1 });
familyMemberSchema.index({ patientProfileId: 1 });

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);

export default FamilyMember;
