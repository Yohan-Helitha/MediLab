// Lab service
const Lab = require('./lab.model');

// Create a new lab
async function createLab(labData) {
  const lab = new Lab(labData);
  return lab.save();
}

// Get all labs, with optional name filter
async function getLabs(filter = {}) {
  const query = {};
  if (filter.name) {
    query.name = { $regex: filter.name, $options: 'i' }; // case-insensitive search
  }
  return Lab.find(query);
}

// Get a single lab by ID
async function getLabById(id) {
  return Lab.findById(id);
}

// Update lab details
async function updateLab(id, updateData) {
  return Lab.findByIdAndUpdate(id, updateData, { new: true });
}

// Delete a lab (hard delete)
async function deleteLab(id) {
  return Lab.findByIdAndDelete(id);
}

// Update lab status (soft delete/activate)
async function updateLabStatus(id, status) {
  return Lab.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
}

module.exports = {
  createLab,
  getLabs,
  getLabById,
  updateLab,
  deleteLab,
  updateLabStatus,
};
