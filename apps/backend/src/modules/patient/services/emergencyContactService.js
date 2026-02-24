import EmergencyContact from "../models/EmergencyContact.js";
import Member from "../models/Member.js";

class EmergencyContactService {
  async getAllEmergencyContacts(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const emergencyContacts = await EmergencyContact.find(filter)
      .populate({
        path: 'member_id',
        model: 'Member',
        localField: 'member_id',
        foreignField: 'member_id'
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await EmergencyContact.countDocuments(filter);
    
    return {
      emergencyContacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getEmergencyContactById(id) {
    const emergencyContact = await EmergencyContact.findById(id).populate({
      path: 'member_id',
      model: 'Member',
      localField: 'member_id',
      foreignField: 'member_id'
    });
    if (!emergencyContact) {
      throw new Error("Emergency contact not found");
    }
    return emergencyContact;
  }

  async createEmergencyContact(emergencyContactData) {
    const emergencyContact = new EmergencyContact(emergencyContactData);
    await emergencyContact.save();
    return await emergencyContact.populate({
      path: 'member_id',
      model: 'Member',
      localField: 'member_id',
      foreignField: 'member_id'
    });
  }

  async updateEmergencyContact(id, updateData) {
    const emergencyContact = await EmergencyContact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'member_id',
      model: 'Member',
      localField: 'member_id',
      foreignField: 'member_id'
    });
    
    if (!emergencyContact) {
      throw new Error("Emergency contact not found");
    }
    return emergencyContact;
  }

  async deleteEmergencyContact(id) {
    const emergencyContact = await EmergencyContact.findByIdAndDelete(id);
    if (!emergencyContact) {
      throw new Error("Emergency contact not found");
    }
    return emergencyContact;
  }
}

export default new EmergencyContactService();