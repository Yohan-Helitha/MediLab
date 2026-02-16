import allergyService from "../services/allergyService.js";

class AllergyController {
  async getAllAllergies(req, res) {
    try {
      const allergies = await allergyService.getAllAllergies(req.query);
      res.status(200).json({
        success: true,
        data: allergies
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllergyById(req, res) {
    try {
      const allergy = await allergyService.getAllergyById(req.params.id);
      res.status(200).json({
        success: true,
        data: allergy
      });
    } catch (error) {
      res.status(error.message === "Allergy not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createAllergy(req, res) {
    try {
      const allergy = await allergyService.createAllergy(req.body);
      res.status(201).json({
        success: true,
        data: allergy
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateAllergy(req, res) {
    try {
      const allergy = await allergyService.updateAllergy(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: allergy
      });
    } catch (error) {
      res.status(error.message === "Allergy not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteAllergy(req, res) {
    try {
      await allergyService.deleteAllergy(req.params.id);
      res.status(200).json({
        success: true,
        message: "Allergy deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "Allergy not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AllergyController();