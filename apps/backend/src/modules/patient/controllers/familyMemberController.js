import familyMemberService from "../services/familyMemberService.js";

class FamilyMemberController {
  async getAllFamilyMembers(req, res) {
    try {
      const familyMembers = await familyMemberService.getAllFamilyMembers(req.query);
      res.status(200).json({
        success: true,
        data: familyMembers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getFamilyMemberById(req, res) {
    try {
      const familyMember = await familyMemberService.getFamilyMemberById(req.params.id);
      res.status(200).json({
        success: true,
        data: familyMember
      });
    } catch (error) {
      res.status(error.message === "Family member not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createFamilyMember(req, res) {
    try {
      const familyMember = await familyMemberService.createFamilyMember(req.body);
      res.status(201).json({
        success: true,
        data: familyMember
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateFamilyMember(req, res) {
    try {
      const familyMember = await familyMemberService.updateFamilyMember(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: familyMember
      });
    } catch (error) {
      res.status(error.message === "Family member not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteFamilyMember(req, res) {
    try {
      await familyMemberService.deleteFamilyMember(req.params.id);
      res.status(200).json({
        success: true,
        message: "Family member deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "Family member not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new FamilyMemberController();