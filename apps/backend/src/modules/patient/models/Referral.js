import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  referral_id: {
    type: String,
    unique: true
  },
  visit_id: {
    type: String,
    required: true,
    maxlength: 50
  },
  referred_to: {
    type: String,
    required: true,
    enum: ['Base Hospital', 'District Hospital', 'Specialist Clinic'],
    maxlength: 150
  },
  referral_reason: {
    type: String,
    required: true
  },
  urgency_level: {
    type: String,
    required: true,
    enum: ['Routine', 'Urgent', 'Emergency'],
    maxlength: 20
  },
  referral_status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending',
    maxlength: 20
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate referral_id
referralSchema.pre('save', async function() {
  if (!this.isNew || this.referral_id) {
    return;
  }

  const currentYear = new Date().getFullYear();
  const prefix = `REF-ANU-${currentYear}-`;
  
  // Find the last referral ID for this year
  const lastReferral = await this.constructor.findOne({
    referral_id: { $regex: `^${prefix}` }
  }).sort({ referral_id: -1 });

  let sequence = 1;
  if (lastReferral && lastReferral.referral_id) {
    const lastSequence = parseInt(lastReferral.referral_id.split('-').pop());
    sequence = lastSequence + 1;
  }

  this.referral_id = `${prefix}${sequence.toString().padStart(5, '0')}`;
});

export default mongoose.model("Referral", referralSchema);