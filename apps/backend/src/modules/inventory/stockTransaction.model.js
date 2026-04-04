import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema(
  {
    healthCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      // Optional: when tracking per-lab transactions. Global inventory uses null.
      required: false,
      index: true,
    },
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ["RESERVE", "DEDUCT", "RESTOCK"],
      required: true,
      index: true,
    },
    referenceBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);

stockTransactionSchema.index({ createdAt: -1 });

const StockTransaction = mongoose.model(
  "StockTransaction",
  stockTransactionSchema,
);

export default StockTransaction;
