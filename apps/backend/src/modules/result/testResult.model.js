import mongoose from "mongoose";

const { Schema } = mongoose;

// ===== EMBEDDED SCHEMAS =====

const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ["sample_received", "processing", "released"],
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: false },
);

const ViewedBySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: false },
);

const FileSchema = new Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    viewLabel: {
      type: String,
      enum: ["Frontal", "Lateral", "Oblique", "AP", "PA", "Other"],
    },
  },
  { _id: false },
);

// Export embedded schemas for use in discriminators
export { FileSchema };

// ===== BASE TEST RESULT SCHEMA =====

const testResultBaseSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
    },
    patientProfileId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
      index: true,
    },
    testTypeId: {
      type: Schema.Types.ObjectId,
      ref: "TestType",
      required: true,
      index: true,
    },
    healthCenterId: {
      type: Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
      index: true,
    },
    observations: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    generatedReportPath: {
      type: String,
    },
    currentStatus: {
      type: String,
      enum: ["sample_received", "processing", "released"],
      default: "released",
      required: true,
      index: true,
    },
    statusHistory: [StatusHistorySchema],
    enteredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    releasedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    viewedBy: [ViewedBySchema],
  },
  {
    discriminatorKey: "testType",
    collection: "testresults",
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

// Indexes
testResultBaseSchema.index({ patientProfileId: 1, releasedAt: -1 });
testResultBaseSchema.index({
  healthCenterId: 1,
  currentStatus: 1,
  releasedAt: -1,
});
testResultBaseSchema.index({ testTypeId: 1, releasedAt: -1 });

const TestResult = mongoose.model("TestResult", testResultBaseSchema);

export default TestResult;
