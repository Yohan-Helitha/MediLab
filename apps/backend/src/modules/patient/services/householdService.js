import Household from "../models/Household.js";

class HouseholdService {
  async getAllHouseholds(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const households = await Household.find(filter)
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
    // Try to find by MongoDB _id first (for internal references)
    let household = await Household.findById(id);
    
    // If not found and id doesn't look like ObjectId, try by custom household_id
    if (!household && !/^[0-9a-fA-F]{24}$/.test(id)) {
      household = await Household.findOne({ household_id: id });
    }
    
    if (!household) {
      throw new Error("Household not found");
    }
    return household;
  }

  async getHouseholdByHouseholdId(household_id) {
    const household = await Household.findOne({ household_id });
    if (!household) {
      throw new Error("Household not found");
    }
    return household;
  }

  async createHousehold(householdData) {
    const household = new Household(householdData);
    await household.save();
    return household;
  }

  async updateHousehold(id, updateData) {
    const household = await Household.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
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