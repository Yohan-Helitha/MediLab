import mongoose from "mongoose";
import Member from "../models/Member.js";

class MemberService {
  async getAllMembers(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const members = await Member.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Member.countDocuments(filter);
    
    return {
      members,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getMemberById(id) {
    const member = await Member.findById(id).lean();
    if (!member) {
      throw new Error("Member not found");
    }

    // Attach additional health and medical info
    const [health_info, medical_history] = await Promise.all([
      mongoose.model("HealthDetails").findOne({ member_id: id }).lean(),
      mongoose.model("PastMedicalHistory").findOne({ member_id: id }).lean()
    ]);

    return {
      ...member,
      health_info,
      medical_history
    };
  }

  async createMember(memberData) {
    const member = new Member(memberData);
    await member.save();
    return member;
  }

  async updateMember(id, updateData) {
    // Check if NIC is being updated and if it conflicts with existing members
    if (updateData.nic) {
      // First get the current member to check if NIC is actually changing
      const currentMember = await Member.findById(id);
      if (!currentMember) {
        throw new Error("Member not found");
      }

      // Only check for conflicts if the NIC is actually being changed
      if (currentMember.nic !== updateData.nic) {
        const existingMember = await Member.findOne({ 
          nic: updateData.nic,
          _id: { $ne: id } // Exclude the current member being updated
        });
        
        if (existingMember) {
          throw new Error(`NIC ${updateData.nic} is already registered to another member`);
        }
      }
    }

    const member = await Member.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!member) {
      throw new Error("Member not found");
    }
    return member;
  }

  async deleteMember(id) {
    const member = await Member.findById(id);
    if (!member) {
      throw new Error("Member not found");
    }

    const memberId = member.member_id;

    // List of models that contain data related to a member
    // Some use 'member_id', others might use 'submitted_by'
    const modelsToClean = [
      "Allergy",
      "Medication",
      "ChronicDisease",
      "HealthDetails",
      "PastMedicalHistory",
      "EmergencyContact",
      "Referral",
      "Visit",
      "Household" // Records submitted by this member
    ];

    // Perform cascading deletion
    await Promise.all(modelsToClean.map(async (modelName) => {
      try {
        const Model = mongoose.model(modelName);
        
        // Delete records where this member is the owner/patient
        await Model.deleteMany({ member_id: memberId });
        
        // Delete records submitted by this member (for snapshots, notes, etc.)
        await Model.deleteMany({ submitted_by: memberId });
      } catch (error) {
        console.error(`Error cleaning up ${modelName} for member ${memberId}:`, error);
      }
    }));

    // Special case: If this member belongs to a household, update the household's member list
    if (member.household_id) {
      await mongoose.model("Household").updateOne(
        { household_id: member.household_id },
        { $pull: { members: memberId } }
      );
    }

    // Finally delete the member itself
    await Member.findByIdAndDelete(id);
    
    return member;
  }
}

export default new MemberService();