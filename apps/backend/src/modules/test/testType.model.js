import mongoose from "mongoose";

const testTypeSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 200,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },

    category: {
      type: String,
      enum: [
        "Blood Chemistry",
        "Hematology",
        "Imaging",
        "Cardiology",
        "Clinical Pathology",
        "Other",
      ],
      required: true,
    },

    description: {
      type: String,
      maxlength: 500,
    },

    // Entry Method
    entryMethod: {
      type: String,
      enum: ["form", "upload"],
      required: true,
    },

    // Discriminator Type (links to TestResult discriminator)
    discriminatorType: {
      type: String,
      enum: [
        "BloodGlucose",
        "Hemoglobin",
        "BloodPressure",
        "Pregnancy",
        "XRay",
        "ECG",
        "Ultrasound",
        "AutomatedReport",
      ],
      required: true,
    },

    // Routine Monitoring Configuration
    isRoutineMonitoringRecommended: {
      type: Boolean,
      default: false,
    },

    recommendedFrequency: {
      type: String,
      enum: ["monthly", "quarterly", "biannually", "annually"],
      required: function () {
        return this.isRoutineMonitoringRecommended === true;
      },
    },

    // Frequency in days (calculated from recommendedFrequency)
    recommendedFrequencyInDays: {
      type: Number,
      required: function () {
        return this.isRoutineMonitoringRecommended === true;
      },
    },

    // Test-Specific Configuration Parameters (flexible object)
    // Used to pre-populate form fields and store test-specific defaults
    // Examples:
    //   - X-Ray: { bodyPart: "Chest", defaultViews: ["PA", "Lateral"] }
    //   - Blood Test: { fastingRequired: true, fastingHours: 8, sampleType: "Capillary" }
    //   - ECG: { leadConfiguration: "12-lead", recordingDuration: "10 seconds" }
    specificParameters: {
      type: mongoose.Schema.Types.Mixed, // Flexible - accepts any key-value pairs
      default: {},
    },

    // Report Template Path (for form-based tests)
    reportTemplate: {
      type: String,
      required: function () {
        return this.entryMethod === "form";
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

// Indexes
testTypeSchema.index({ code: 1 }, { unique: true });
testTypeSchema.index({ discriminatorType: 1 });
testTypeSchema.index({ isActive: 1 });

const TestType = mongoose.model("TestType", testTypeSchema);

export default TestType;
