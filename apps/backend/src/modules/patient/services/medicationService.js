import Medication from "../models/Medication.js";

class MedicationService {
  async getAllMedications(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const medications = await Medication.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Medication.countDocuments(filter);
    
    return {
      medications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getMedicationById(id) {
    const medication = await Medication.findById(id);
    if (!medication) {
      throw new Error("Medication not found");
    }
    return medication;
  }

  async createMedication(medicationData) {
    const medication = new Medication(medicationData);
    await medication.save();
    return medication;
  }

  async updateMedication(id, updateData) {
    const medication = await Medication.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!medication) {
      throw new Error("Medication not found");
    }
    return medication;
  }

  async deleteMedication(id) {
    const medication = await Medication.findByIdAndDelete(id);
    if (!medication) {
      throw new Error("Medication not found");
    }
    return medication;
  }
}

export default new MedicationService();