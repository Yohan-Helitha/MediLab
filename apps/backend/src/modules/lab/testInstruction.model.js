import mongoose from 'mongoose';

const testInstructionSchema = new mongoose.Schema(
  {
    diagnosticTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestType',
      required: true
    },

    preTestInstructions: {
      type: [String],
      default: []
    },
    postTestInstructions: {
      type: [String],
      default: []
    },

    languageCode: {
      type: String,
      enum: ['en', 'si', 'ta'],
      default: 'en'
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
testInstructionSchema.index({ diagnosticTestId: 1, languageCode: 1 }, { unique: true });
testInstructionSchema.index({ diagnosticTestId: 1 });

const TestInstruction = mongoose.model('TestInstruction', testInstructionSchema);

export default TestInstruction;
