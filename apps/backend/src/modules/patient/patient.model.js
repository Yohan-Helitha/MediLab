import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema(
  {
    // BASIC INFORMATION
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    nic: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    age: {
      type: Number
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true
    },
    language: {
      type: String,
      enum: ['en', 'si', 'ta'],
      default: 'en'
    },

    // CONTACT
    contactNumber: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    gnDivision: {
      type: String
    },
    district: {
      type: String,
      required: true
    },

    // AUTHENTICATION
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },

    // HOUSEHOLD LINK
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household'
    },

    // PROFILE MEDIA
    photoUrl: {
      type: String
    },

    // MEDICAL FLAGS
    disabilityStatus: {
      type: Boolean,
      default: false
    },
    pregnancyStatus: {
      type: Boolean,
      default: false
    },

    // SYSTEM
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual for calculating age
patientProfileSchema.pre('save', function (next) {
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
patientProfileSchema.index({ nic: 1 });
patientProfileSchema.index({ username: 1 });
patientProfileSchema.index({ householdId: 1 });
patientProfileSchema.index({ district: 1 });

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

export default PatientProfile;
