import mongoose from "mongoose";

const householdSchema = new mongoose.Schema({
  household_code: {
    type: String,
    unique: true,
    maxlength: 50
  },
  head_member_name: {
    type: String,
    required: true,
    maxlength: 150
  },
  primary_contact_number: {
    type: String,
    required: true,
    maxlength: 20
  },
  secondary_contact_number: {
    type: String,
    maxlength: 20
  },
  address: {
    type: String,
    required: true
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
  registered_by_staff_id: {
    type: String,
    required: true,
    maxlength: 20
  },
  registration_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate household_code
householdSchema.pre('save', async function() {
  // Only generate household_code if it's not already set (for new documents)
  if (!this.household_code) {
    // Find the latest household with the highest code
    const latestHousehold = await mongoose.model('Household').findOne({
      household_code: { $regex: /^PADGNDIV-\d{3}$/ }
    }).sort({ household_code: -1 }).exec();
    
    let nextNumber = 1;
    if (latestHousehold && latestHousehold.household_code) {
      // Extract the numeric part and increment
      const lastNumber = parseInt(latestHousehold.household_code.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    
    // Format the household code with leading zeros
    this.household_code = `PADGNDIV-${nextNumber.toString().padStart(3, '0')}`;
    
    // Ensure registration_date is set to current date/time
    if (!this.registration_date) {
      this.registration_date = new Date();
    }
  }
});

export default mongoose.model("Household", householdSchema);