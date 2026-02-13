import mongoose from 'mongoose';

const translationSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['LAB', 'TEST', 'INSTRUCTION'],
      required: true
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'entityTypeRef'
    },

    // Virtual field to determine the reference model based on entityType
    entityTypeRef: {
      type: String,
      enum: ['Lab', 'DiagnosticTest', 'TestInstruction']
    },

    languageCode: {
      type: String,
      enum: ['en', 'si', 'ta'],
      required: true
    },

    translatedFields: {
      type: Map,
      of: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to set the correct reference model
translationSchema.pre('save', function (next) {
  if (this.entityType === 'LAB') {
    this.entityTypeRef = 'Lab';
  } else if (this.entityType === 'TEST') {
    this.entityTypeRef = 'DiagnosticTest';
  } else if (this.entityType === 'INSTRUCTION') {
    this.entityTypeRef = 'TestInstruction';
  }
  next();
});

// Indexes
translationSchema.index({ entityType: 1, entityId: 1, languageCode: 1 }, { unique: true });
translationSchema.index({ entityId: 1 });
translationSchema.index({ languageCode: 1 });

const Translation = mongoose.model('Translation', translationSchema);

export default Translation;
