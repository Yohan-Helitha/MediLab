import Referral from "../models/Referral.js";

class ReferralService {
  async getAllReferrals(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const referrals = await Referral.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Referral.countDocuments(filter);
    
    return {
      referrals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getReferralById(id) {
    const referral = await Referral.findById(id);
    if (!referral) {
      throw new Error("Referral not found");
    }
    return referral;
  }

  async createReferral(referralData) {
    const referral = new Referral(referralData);
    await referral.save();
    return referral;
  }

  async updateReferral(id, updateData) {
    const referral = await Referral.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!referral) {
      throw new Error("Referral not found");
    }
    return referral;
  }

  async deleteReferral(id) {
    const referral = await Referral.findByIdAndDelete(id);
    if (!referral) {
      throw new Error("Referral not found");
    }
    return referral;
  }

  async getReferralsByVisitId(visitId) {
    return await Referral.find({ visit_id: visitId }).sort({ createdAt: -1 });
  }
}

export default new ReferralService();