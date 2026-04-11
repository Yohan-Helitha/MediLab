import mongoose from "mongoose";

const householdSchema = new mongoose.Schema({
  household_id: {
    type: String,
    unique: true,
    maxlength: 50
  },
  head_member_name: {
    type: String,
    required: true,
    maxlength: 150
  },
  submitted_by: {
    type: String,
    required: true,
    index: true
  },
  primary_contact_number: {
    type: String,
    required: true,
    maxlength: 20
  },
  secondary_contact_number: {
    type: String,
    required: false,
    maxlength: 20
  },
  address: {
    type: String,
    required: true,
    unique: true
  },
  village_name: {
    type: String,
    required: true,
    maxlength: 100
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
  province: {
    type: String,
    required: true,
    maxlength: 100
  },
  registration_date: {
    type: Date,
    default: Date.now
  },
  // ENVIRONMENTAL HEALTH FACTORS
  water_source: {
    type: String, // PIPE_BORNE | PROTECTED_WELL | UNPROTECTED_WELL | RIVER | TANK | BOTTLE_WATER | TUBE_WELL | OTHER
    required: true,
    maxlength: 50
  },
  well_water_tested: {
    type: String, // YES | NO | NOT_SURE
    required: true,
    maxlength: 20
  },
  ckdu_exposure_area: {
    type: String, // YES | NO | NOT_SURE
    required: true,
    maxlength: 20
  },
  dengue_risk: {
    type: Boolean,
    required: true,
    default: false
  },
  sanitation_type: {
    type: String, // INDOOR | OUTDOOR | SHARED | NO_PROPER
    required: true,
    maxlength: 50
  },
  waste_disposal: {
    type: String, // MUNICIPAL | BURNING | BURYING | OPEN_DUMPING
    required: true,
    maxlength: 50
  },
  pesticide_exposure: {
    type: Boolean,
    required: true,
    default: false
  },
  // FAMILY CHRONIC DISEASE HISTORY
  chronic_diseases: {
    diabetes: { type: Boolean, required: true, default: false },
    hypertension: { type: Boolean, required: true, default: false },
    kidney_disease: { type: Boolean, required: true, default: false },
    asthma: { type: Boolean, required: true, default: false },
    heart_disease: { type: Boolean, required: true, default: false },
    other: { type: String, default: "" },
    none: { type: Boolean, required: true, default: false }
  },
  members: [{
    type: String, // member_id
    maxlength: 50
  }]
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate household_id
householdSchema.pre('save', async function () {
  // Only generate household_id if it's not already set (for new documents)
  if (!this.household_id && this.isNew) {
    // Find the latest household with the highest ID
    const latestHousehold = await mongoose.model('Household').findOne({
      household_id: { $regex: /^ANU-PADGNDIV-\d{5}$/ }
    }).sort({ household_id: -1 }).exec();

    let nextNumber = 1;
    if (latestHousehold && latestHousehold.household_id) {
      // Extract the numeric part and increment
      const parts = latestHousehold.household_id.split('-');
      const lastNumber = parseInt(parts[parts.length - 1]);
      nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }

    // Format the household ID with leading zeros
    this.household_id = `ANU-PADGNDIV-${String(nextNumber).padStart(5, '0')}`;
  }

  // Ensure registration_date is set to current date/time
  if (!this.registration_date) {
    this.registration_date = new Date();
  }
});

export default mongoose.model("Household", householdSchema);