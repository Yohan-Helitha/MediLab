import PastMedicalHistory from "../models/PastMedicalHistory.js";

class PastMedicalHistoryService {
  async getAllPastMedicalHistories(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const pastMedicalHistories = await PastMedicalHistory.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await PastMedicalHistory.countDocuments(filter);
    
    return {
      pastMedicalHistories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getPastMedicalHistoryById(id) {
    const pastMedicalHistory = await PastMedicalHistory.findById(id);
    if (!pastMedicalHistory) {
      throw new Error("PastMedicalHistory not found");
    }
    return pastMedicalHistory;
  }

  async createPastMedicalHistory(pastMedicalHistoryData) {
    const pastMedicalHistory = new PastMedicalHistory(pastMedicalHistoryData);
    await pastMedicalHistory.save();
    return pastMedicalHistory;
  }

  async updatePastMedicalHistory(id, updateData) {
    const pastMedicalHistory = await PastMedicalHistory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!pastMedicalHistory) {
      throw new Error("PastMedicalHistory not found");
    }
    return pastMedicalHistory;
  }

  async deletePastMedicalHistory(id) {
    const pastMedicalHistory = await PastMedicalHistory.findByIdAndDelete(id);
    if (!pastMedicalHistory) {
      throw new Error("PastMedicalHistory not found");
    }
    return pastMedicalHistory;
  }
}

export default new PastMedicalHistoryService();