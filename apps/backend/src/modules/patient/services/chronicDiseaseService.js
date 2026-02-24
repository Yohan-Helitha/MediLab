import ChronicDisease from "../models/ChronicDisease.js";

class ChronicDiseaseService {
  async getAllChronicDiseases(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const chronicDiseases = await ChronicDisease.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await ChronicDisease.countDocuments(filter);
    
    return {
      chronicDiseases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getChronicDiseaseById(id) {
    const chronicDisease = await ChronicDisease.findById(id);
    if (!chronicDisease) {
      throw new Error("ChronicDisease not found");
    }
    return chronicDisease;
  }

  async createChronicDisease(chronicDiseaseData) {
    const chronicDisease = new ChronicDisease(chronicDiseaseData);
    await chronicDisease.save();
    return chronicDisease;
  }

  async updateChronicDisease(id, updateData) {
    const chronicDisease = await ChronicDisease.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!chronicDisease) {
      throw new Error("ChronicDisease not found");
    }
    return chronicDisease;
  }

  async deleteChronicDisease(id) {
    const chronicDisease = await ChronicDisease.findByIdAndDelete(id);
    if (!chronicDisease) {
      throw new Error("ChronicDisease not found");
    }
    return chronicDisease;
  }
}

export default new ChronicDiseaseService();