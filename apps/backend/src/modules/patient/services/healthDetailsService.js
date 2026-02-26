import HealthDetails from "../models/HealthDetails.js";

class HealthDetailsService {
  async getAllHealthDetails(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const healthDetails = await HealthDetails.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await HealthDetails.countDocuments(filter);
    
    return {
      healthDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getHealthDetailsById(id) {
    const healthDetails = await HealthDetails.findById(id);
    if (!healthDetails) {
      throw new Error("Health details not found");
    }
    return healthDetails;
  }

  async createHealthDetails(healthDetailsData) {
    const healthDetails = new HealthDetails(healthDetailsData);
    await healthDetails.save();
    return healthDetails;
  }

  async updateHealthDetails(id, updateData) {
    const healthDetails = await HealthDetails.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!healthDetails) {
      throw new Error("Health details not found");
    }
    return healthDetails;
  }

  async deleteHealthDetails(id) {
    const healthDetails = await HealthDetails.findByIdAndDelete(id);
    if (!healthDetails) {
      throw new Error("Health details not found");
    }
    return healthDetails;
  }
}

export default new HealthDetailsService();