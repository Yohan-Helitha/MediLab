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
    const member = await Member.findById(id);
    if (!member) {
      throw new Error("Member not found");
    }
    return member;
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
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      throw new Error("Member not found");
    }
    return member;
  }
}

export default new MemberService();