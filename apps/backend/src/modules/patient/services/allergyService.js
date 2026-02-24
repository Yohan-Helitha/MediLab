import Allergy from "../models/Allergy.js";

class AllergyService {
  async getAllAllergies(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const allergies = await Allergy.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Allergy.countDocuments(filter);
    
    return {
      allergies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getAllergyById(id) {
    const allergy = await Allergy.findById(id);
    if (!allergy) {
      throw new Error("Allergy not found");
    }
    return allergy;
  }

  async createAllergy(allergyData) {
    const allergy = new Allergy(allergyData);
    await allergy.save();
    return allergy;
  }

  async updateAllergy(id, updateData) {
    const allergy = await Allergy.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!allergy) {
      throw new Error("Allergy not found");
    }
    return allergy;
  }

  async deleteAllergy(id) {
    const allergy = await Allergy.findByIdAndDelete(id);
    if (!allergy) {
      throw new Error("Allergy not found");
    }
    return allergy;
  }
}

export default new AllergyService();