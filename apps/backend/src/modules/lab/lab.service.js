import Lab from './lab.model.js';

export const createLab = async (labData) => {
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


