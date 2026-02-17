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
      .sort({ createdAt: -1 });
    
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
    const familyMember = await FamilyMember.findOne({ family_member_id: familyMemberId }).populate({
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
    const familyMember = await FamilyMember.findOneAndUpdate(
      { family_member_id: familyMemberId },
      updateData,
      { new: true, runValidators: true }
    ).populate({
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

  async deleteFamilyMember(familyMemberId) {
    const familyMember = await FamilyMember.findOneAndDelete({ family_member_id: familyMemberId });
    if (!familyMember) {
      throw new Error("Family member not found");
    }
    return familyMember;
  }
}

export default new FamilyMemberService();