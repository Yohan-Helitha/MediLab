import familyRelationshipService from "../services/familyRelationshipService.js";

class FamilyRelationshipController {
  async getAllFamilyRelationships(req, res) {
    try {
      const familyRelationships = await familyRelationshipService.getAllFamilyRelationships(req.query);
      res.status(200).json({
        success: true,
        data: familyRelationships
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getFamilyRelationshipById(req, res) {
    try {
      const familyRelationship = await familyRelationshipService.getFamilyRelationshipById(req.params.id);
      res.status(200).json({
        success: true,
        data: familyRelationship
      });
    } catch (error) {
      res.status(error.message === "Family relationship not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createFamilyRelationship(req, res) {
    try {
      const familyRelationship = await familyRelationshipService.createFamilyRelationship(req.body);
      res.status(201).json({
        success: true,
        data: familyRelationship
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateFamilyRelationship(req, res) {
    try {
      const familyRelationship = await familyRelationshipService.updateFamilyRelationship(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: familyRelationship
      });
    } catch (error) {
      res.status(error.message === "Family relationship not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteFamilyRelationship(req, res) {
    try {
      await familyRelationshipService.deleteFamilyRelationship(req.params.id);
      res.status(200).json({
        success: true,
        message: "Family relationship deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "Family relationship not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getFamilyTree(req, res) {
    try {
      const familyTree = await familyRelationshipService.getFamilyTree(req.params.familyMemberId);
      res.status(200).json({
        success: true,
        data: familyTree
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new FamilyRelationshipController();