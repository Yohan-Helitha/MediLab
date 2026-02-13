import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationLogSchema = new Schema(
  {
    // Patient reference
    patientProfileId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
      index: true,
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "result_ready",
        "unviewed_result_reminder",
        "routine_checkup_reminder",
      ],
      required: true,
      index: true,
    },

    // Communication channel
    channel: {
      type: String,
      enum: ["sms", "email"],
      required: true,
    },

    // Recipient contact
    recipient: {
      type: String,
      required: true,
    },

    // Notification status
    status: {
      type: String,
      enum: ["sent", "failed"],
      required: true,
      index: true,
    },

    // Error message if failed
    errorMessage: {
      type: String,
      default: null,
    },

    // Message content (truncated for storage)
    messageContent: {
      type: String,
      required: true,
    },

    // Related entities
    testResultId: {
      type: Schema.Types.ObjectId,
      ref: "TestResult",
      index: true,
    },

    reminderSubscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "ReminderSubscription",
      index: true,
    },

    // Timestamp
    sentAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },

    // Third-party API response
    apiResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
notificationLogSchema.index({ patientProfileId: 1, sentAt: -1 });
notificationLogSchema.index({ type: 1, status: 1, sentAt: -1 });
notificationLogSchema.index({ testResultId: 1 });
notificationLogSchema.index({ sentAt: -1 });

const NotificationLog = mongoose.model(
  "NotificationLog",
  notificationLogSchema,
);

export default NotificationLog;
