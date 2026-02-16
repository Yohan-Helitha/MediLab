import memberService from "../services/memberService.js";

class MemberController {
  async getAllMembers(req, res) {
    try {
      const members = await memberService.getAllMembers(req.query);
      res.status(200).json({
        success: true,
        data: members
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getMemberById(req, res) {
    try {
      const member = await memberService.getMemberById(req.params.id);
      res.status(200).json({
        success: true,
        data: member
      });
    } catch (error) {
      res.status(error.message === "Member not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createMember(req, res) {
    try {
      const member = await memberService.createMember(req.body);
      res.status(201).json({
        success: true,
        data: member
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateMember(req, res) {
    try {
      const member = await memberService.updateMember(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: member
      });
    } catch (error) {
      res.status(error.message === "Member not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteMember(req, res) {
    try {
      await memberService.deleteMember(req.params.id);
      res.status(200).json({
        success: true,
        message: "Member deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "Member not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new MemberController();