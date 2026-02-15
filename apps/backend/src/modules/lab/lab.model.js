// Lab model
import mongoose from "mongoose";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // "HH:mm"

const operatingHoursSchema = new mongoose.Schema(
	{
		day: { type: String, trim: true }, // e.g., "Monday"
		openTime: {
			type: String,
			trim: true,
			validate: {
				validator: (v) => !v || timeRegex.test(v),
				message: "openTime must be in HH:mm format",
			},
		},
		closeTime: {
			type: String,
			trim: true,
			validate: {
				validator: (v) => !v || timeRegex.test(v),
				message: "closeTime must be in HH:mm format",
			},
		},
	},
	{ _id: false }
);

const labSchema = new mongoose.Schema(
	{
		// BASIC INFORMATION
		name: { type: String, required: true, trim: true, maxlength: 200 },
		addressLine1: { type: String, trim: true, maxlength: 200 },
		addressLine2: { type: String, trim: true, maxlength: 200 },
		district: { type: String, trim: true, maxlength: 100 },
		province: { type: String, trim: true, maxlength: 100 },

		// LOCATION (Optional but Recommended)
		latitude: { type: Number, min: -90, max: 90 },
		longitude: { type: Number, min: -180, max: 180 },

		// CONTACT
		phoneNumber: { type: String, trim: true, maxlength: 40 },
		email: {
			type: String,
			trim: true,
			lowercase: true,
			maxlength: 200,
			validate: {
				validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
				message: "Invalid email address",
			},
		},

		// OPERATING HOURS
		operatingHours: [operatingHoursSchema],

		// STATUS CONTROL
		operationalStatus: {
			type: String,
			enum: ["OPEN", "CLOSED", "HOLIDAY", "MAINTENANCE"],
			default: "OPEN",
			index: true,
		},

		isActive: { type: Boolean, default: true, index: true },

		// AUDIT FIELDS
		createdBy: { type: mongoose.Schema.Types.ObjectId },
	},
	{ timestamps: true }
);

// Helpful index for lookups by name and region
labSchema.index({ name: 1, district: 1, province: 1 });

const Lab = mongoose.model("Lab", labSchema);

export default Lab;
