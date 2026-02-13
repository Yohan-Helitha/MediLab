import mongoose from "mongoose";

const { Schema } = mongoose;

const reminderSubscriptionSchema = new Schema(
  {
    // Patient reference
    patientProfileId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
      index: true,
    },

    // Test type reference (includes frequency via testType.recommendedFrequency)
    testTypeId: {
      type: Schema.Types.ObjectId,
      ref: "TestType",
      required: true,
      index: true,
    },

    // Last test date
    lastTestDate: {
      type: Date,
      required: true,
    },

    // Next reminder date
    nextReminderDate: {
      type: Date,
      required: true,
      index: true,
    },

    // Subscription status
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
      index: true,
    },

    // Timestamps
    subscribedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    unsubscribedAt: {
      type: Date,
      default: null,
    },

    // Last reminder sent timestamp
    lastReminderSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
reminderSubscriptionSchema.index({ patientProfileId: 1, testTypeId: 1 });
reminderSubscriptionSchema.index({ nextReminderDate: 1, status: 1 });
reminderSubscriptionSchema.index({ status: 1 });

// Unique constraint: one active subscription per patient per test type
reminderSubscriptionSchema.index(
  { patientProfileId: 1, testTypeId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
  },
);

const ReminderSubscription = mongoose.model(
  "ReminderSubscription",
  reminderSubscriptionSchema,
);

export default ReminderSubscription;
