import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      unique: true,
    },
    type: {
      type: String,
      enum: ["CONSUMABLE", "REUSABLE"],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Helpful index for lookups by name and type
equipmentSchema.index({ name: 1 });

const Equipment = mongoose.model("Equipment", equipmentSchema);

export default Equipment;
