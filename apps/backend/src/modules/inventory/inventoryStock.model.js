import mongoose from "mongoose";

const inventoryStockSchema = new mongoose.Schema(
  {
    healthCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
      index: true,
    },
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
      index: true,
    },
    availableQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumThreshold: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// One stock record per equipment per health center
inventoryStockSchema.index(
  { healthCenterId: 1, equipmentId: 1 },
  { unique: true },
);

const InventoryStock = mongoose.model("InventoryStock", inventoryStockSchema);

export default InventoryStock;
