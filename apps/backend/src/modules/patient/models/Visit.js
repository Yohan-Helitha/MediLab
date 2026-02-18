import mongoose from "mongoose";

const visitSchema = new mongoose.Schema({
  visit_id: {
    type: String,
    unique: true
  },
  member_id: {
    type: String,
    required: true,
    maxlength: 50
  },
  household_id: {
    type: String,
    required: true,
    maxlength: 50
  },
  visit_date: {
    type: Date,
    required: true
  },
  visit_type: {
    type: String,
    required: true,
    maxlength: 50
  },
  reason_for_visit: {
    type: String,
    required: true
  },
  doctor_notes: {
    type: String
  },
  diagnosis: {
    type: String
  },
  follow_up_required: {
    type: Boolean,
    default: false
  },
  follow_up_date: {
    type: Date
  },
  created_by_staff_id: {
    type: String,
    required: true,
    maxlength: 20
  }
}, {
  timestamps: true
});

// Helper function to get visit type abbreviation
const getVisitTypeAbbreviation = (visitType) => {
  const typeMap = {
    'OPD': 'OPD',
    'Mobile clinic': 'MOBILE',
    'Home visit': 'HOME'
  };
  return typeMap[visitType] || visitType.toUpperCase().replace(/\s+/g, '');
};

// Pre-save middleware to generate visit_id
visitSchema.pre('save', async function() {
  if (!this.isNew || this.visit_id) {
    return;
  }

  const visitDate = new Date(this.visit_date);
  const dateStr = visitDate.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
  const typeAbbr = getVisitTypeAbbreviation(this.visit_type);
  
  // Find the last visit ID for this date and type
  const prefix = `VST-${typeAbbr}-${dateStr}-`;
  const lastVisit = await this.constructor.findOne({
    visit_id: { $regex: `^${prefix}` }
  }).sort({ visit_id: -1 });

  let sequence = 1;
  if (lastVisit && lastVisit.visit_id) {
    const lastSequence = parseInt(lastVisit.visit_id.split('-').pop());
    sequence = lastSequence + 1;
  }

  this.visit_id = `${prefix}${sequence.toString().padStart(5, '0')}`;
});

export default mongoose.model("Visit", visitSchema);