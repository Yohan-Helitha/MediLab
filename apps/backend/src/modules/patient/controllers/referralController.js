import referralService from "../services/referralService.js";

class ReferralController {
  async getAllReferrals(req, res) {
    try {
      const referrals = await referralService.getAllReferrals(req.query);
      res.status(200).json({
        success: true,
        data: referrals
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getReferralById(req, res) {
    try {
      const referral = await referralService.getReferralById(req.params.id);
      res.status(200).json({
        success: true,
        data: referral
      });
    } catch (error) {
      res.status(error.message === "Referral not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getReferralsByVisitId(req, res) {
    try {
      const referrals = await referralService.getReferralsByVisitId(req.params.visitId);
      res.status(200).json({
        success: true,
        data: referrals
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createReferral(req, res) {
    try {
      const referral = await referralService.createReferral(req.body);
      res.status(201).json({
        success: true,
        data: referral
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateReferral(req, res) {
    try {
      const referral = await referralService.updateReferral(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: referral
      });
    } catch (error) {
      res.status(error.message === "Referral not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteReferral(req, res) {
    try {
      await referralService.deleteReferral(req.params.id);
      res.status(200).json({
        success: true,
        message: "Referral deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "Referral not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new ReferralController();