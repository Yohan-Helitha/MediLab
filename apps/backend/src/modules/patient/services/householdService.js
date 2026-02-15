import Household from "../models/Household.js";

class HouseholdService {
  async getAllHouseholds(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const households = await Household.find(filter)
      .populate("registered_by_staff_id")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ registration_date: -1 });
    
    const total = await Household.countDocuments(filter);
    
    return {
      households,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getHouseholdById(id) {
    const household = await Household.findById(id).populate("registered_by_staff_id");
    if (!household) {
      throw new Error("Household not found");
    }
    return household;
  }

  async createHousehold(householdData) {
    const household = new Household(householdData);
    await household.save();
    return await household.populate("registered_by_staff_id");
  }

  async updateHousehold(id, updateData) {
    const household = await Household.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("registered_by_staff_id");
    
    if (!household) {
      throw new Error("Household not found");
    }
    return household;
  }

  async deleteHousehold(id) {
    const household = await Household.findByIdAndDelete(id);
    if (!household) {
      throw new Error("Household not found");
    }
    return household;
  }
}

export default new HouseholdService();