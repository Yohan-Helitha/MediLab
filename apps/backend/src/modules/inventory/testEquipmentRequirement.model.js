import mongoose from "mongoose";

const testEquipmentRequirementSchema = new mongoose.Schema(
  {
    testTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestType",
      required: true,
      index: true,
    },
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
      index: true,
    },
    quantityPerTest: {
      type: Number,
      required: true,
      min: 1,
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

// Ensure a test type cannot configure the same equipment twice
testEquipmentRequirementSchema.index(
  { testTypeId: 1, equipmentId: 1 },
  { unique: true },
);

const TestEquipmentRequirement = mongoose.model(
  "TestEquipmentRequirement",
  testEquipmentRequirementSchema,
);

export default TestEquipmentRequirement;
