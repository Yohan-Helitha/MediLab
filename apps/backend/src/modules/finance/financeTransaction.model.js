import mongoose from 'mongoose';

const financeTransactionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'ONLINE'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'UNPAID',
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthOfficer',
    },
    paymentReference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

financeTransactionSchema.index({ bookingId: 1 });
financeTransactionSchema.index({ centerId: 1, createdAt: 1 });
financeTransactionSchema.index({ paymentStatus: 1, paymentMethod: 1 });

const FinanceTransaction = mongoose.model(
  'FinanceTransaction',
  financeTransactionSchema,
);

export default FinanceTransaction;
