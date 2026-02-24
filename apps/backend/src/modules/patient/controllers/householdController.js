import householdService from "../services/householdService.js";

class HouseholdController {
  async getAllHouseholds(req, res) {
    try {
      const households = await householdService.getAllHouseholds(req.query);
      res.status(200).json({
        success: true,
        data: households
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getHouseholdById(req, res) {
    try {
      const household = await householdService.getHouseholdById(req.params.id);
      res.status(200).json({
        success: true,
        data: household
      });
    } catch (error) {
      res.status(error.message === "Household not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createHousehold(req, res) {
    try {
      const household = await householdService.createHousehold(req.body);
      res.status(201).json({
        success: true,
        data: household
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateHousehold(req, res) {
    try {
      const household = await householdService.updateHousehold(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: household
      });
    } catch (error) {
      res.status(error.message === "Household not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteHousehold(req, res) {
    try {
      await householdService.deleteHousehold(req.params.id);
      res.status(200).json({
        success: true,
        message: "Household deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "Household not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new HouseholdController();