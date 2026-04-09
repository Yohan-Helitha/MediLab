import Lab from './lab.model.js';

// Helper to normalize strings for exact-match comparison
// Trims whitespace and lowercases, but otherwise keeps content the same.
const normalize = (value) => (value || '').trim().toLowerCase();

export const createLab = async (labData) => {
  const nameNorm = normalize(labData.name);
  const address1Norm = normalize(labData.addressLine1);
  const address2Norm = normalize(labData.addressLine2);

  // Build a single full address string for comparison (line1 + line2)
  const newAddress = `${address1Norm} ${address2Norm}`.trim();

  if (nameNorm) {
    const existing = await Lab.findOne({
      // Compare normalized name and combined address
      name: new RegExp(`^${nameNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      $expr: {
        $eq: [
          {
            $trim: {
              input: { $concat: [
                { $toLower: { $ifNull: ['$addressLine1', ''] } },
                ' ',
                { $toLower: { $ifNull: ['$addressLine2', ''] } },
              ] },
            },
          },
          newAddress,
        ],
      },
    });

    if (existing) {
      const error = new Error('This lab already exists. Please check again.');
      error.code = 'LAB_ALREADY_EXISTS';
      throw error;
    }
  }

  const lab = new Lab(labData);
  return lab.save();
};

export const getLabs = async (filter = {}) => {
  const query = {};
  if (filter.name) {
    query.name = { $regex: filter.name, $options: 'i' };
  }
  return Lab.find(query);
};

export const getLabById = async (id) => {
  return Lab.findById(id);
};

export const updateLab = async (id, updateData) => {
  return Lab.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteLab = async (id) => {
  return Lab.findByIdAndDelete(id);
};

export const updateLabStatus = async (id, status) => {
  return Lab.findByIdAndUpdate(
    id,
    { operationalStatus: status },
    { new: true }
  );
};


