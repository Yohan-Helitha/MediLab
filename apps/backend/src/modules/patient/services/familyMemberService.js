import FamilyMember from "../models/FamilyMember.js";
import Household from "../models/Household.js";

class FamilyMemberService {
  async getAllFamilyMembers(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const familyMembers = await FamilyMember.find(filter)
      .populate({
        path: 'household_id',
        model: 'Household',
        localField: 'household_id',
        foreignField: 'household_id'
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ isHead: -1, createdAt: -1 }); // Sort by isHead first (heads first), then by createdAt
    
    const total = await FamilyMember.countDocuments(filter);
    
    return {
      familyMembers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getFamilyMemberById(familyMemberId) {
    const familyMember = await FamilyMember.findById(familyMemberId).populate({
      path: 'household_id',
      model: 'Household',
      localField: 'household_id',
      foreignField: 'household_id'
    });
    if (!familyMember) {
      throw new Error("Family member not found");
    }
    return familyMember;
  }

  async createFamilyMember(familyMemberData) {
    const familyMember = new FamilyMember(familyMemberData);
    await familyMember.save();
    return await familyMember.populate({
      path: 'household_id',
      model: 'Household',
      localField: 'household_id',
      foreignField: 'household_id'
    });
  }

  async updateFamilyMember(familyMemberId, updateData) {
    let familyMember;
    
    try {
      // Build query based on ID format
      // Check if it looks like a MongoDB ObjectId (24 hex characters)
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(familyMemberId);
      
      let query;
      if (isMongoId) {
        // Try both _id and family_member_id for MongoDB IDs
        query = { $or: [{ _id: familyMemberId }, { family_member_id: familyMemberId }] };
      } else {
        // For custom IDs, only search by family_member_id to avoid ObjectId casting errors
        query = { family_member_id: familyMemberId };
      }
      
      familyMember = await FamilyMember.findOneAndUpdate(
        query,
        updateData,
        { returnDocument: 'after', new: true }
      ).populate({
        path: 'household_id',
        model: 'Household',
        localField: 'household_id',
        foreignField: 'household_id'
      });
    } catch (err) {
      throw err;
    }
    
    if (!familyMember) {
      throw new Error("Family member not found");
    }
    return familyMember;
  }

  async deleteFamilyMember(familyMemberId) {
    const familyMember = await FamilyMember.findByIdAndDelete(familyMemberId);
    if (!familyMember) {
      throw new Error("Family member not found");
    }
    return familyMember;
  }
}

export default new FamilyMemberService();