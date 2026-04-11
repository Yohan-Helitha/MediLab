import mongoose from 'mongoose';

const healthOfficerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      default: 'OTHER'
    },
    employeeId: {
      type: String,
      unique: true,
      trim: true
    },

    contactNumber: {
      type: String,
      required: true,
      maxlength: 20
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    assignedArea: {
      type: String
    },
    role: {
      type: String,
      enum: ['MOH', 'PHI', 'Nurse', 'Admin', 'Lab_Technician', 'Doctor', 'HealthOfficer', 'Staff'],
      required: true
    },

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

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes (unique fields already have indexes, so only non-unique fields need explicit indexes)
healthOfficerSchema.index({ role: 1 });
healthOfficerSchema.index({ assignedArea: 1 });

// Pre-save middleware to auto-generate employee ID
healthOfficerSchema.pre('save', async function() {
  // Normalize and validate contactNumber to +94xxxxxxxxx
  if (this.contactNumber) {
    let v = String(this.contactNumber).trim();
    if (/^0\d{9}$/.test(v)) {
      v = `+94${v.slice(1)}`;
    }
    if (/^\d{9}$/.test(v)) {
      v = `+94${v}`;
    }
    if (!/^\+94\d{9}$/.test(v)) {
      throw new Error('Invalid contact number format. Expected +94xxxxxxxxx');
    }
    this.contactNumber = v;
  }
  if (!this.employeeId) {
    const currentYear = new Date().getFullYear();
    const prefix = this.role === 'Lab_Technician' ? 'LAB' : 'HO';
    const regex = new RegExp(`^${prefix}-${currentYear}-\\d{3}$`);

    const latestOfficer = await mongoose.model('HealthOfficer').findOne({
      employeeId: { $regex: regex }
    }).sort({ employeeId: -1 }).exec();

    let nextNumber = 1;
    if (latestOfficer && latestOfficer.employeeId) {
      const idParts = latestOfficer.employeeId.split('-');
      nextNumber = parseInt(idParts[2]) + 1;
    }
    this.employeeId = `${prefix}-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
  }
});

const HealthOfficer = mongoose.model('HealthOfficer', healthOfficerSchema);

export default HealthOfficer;
