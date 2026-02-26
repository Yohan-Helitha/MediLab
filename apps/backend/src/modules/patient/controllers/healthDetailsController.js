import healthDetailsService from "../services/healthDetailsService.js";

class HealthDetailsController {
  async getAllHealthDetails(req, res) {
    try {
      const healthDetails = await healthDetailsService.getAllHealthDetails(req.query);
      res.status(200).json({
        success: true,
        data: healthDetails
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getHealthDetailsById(req, res) {
    try {
      const healthDetails = await healthDetailsService.getHealthDetailsById(req.params.id);
      res.status(200).json({
        success: true,
        data: healthDetails
      });
    } catch (error) {
      res.status(error.message === "Health details not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createHealthDetails(req, res) {
    try {
      const healthDetails = await healthDetailsService.createHealthDetails(req.body);
      res.status(201).json({
        success: true,
        data: healthDetails
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateHealthDetails(req, res) {
    try {
      const healthDetails = await healthDetailsService.updateHealthDetails(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: healthDetails
      });
    } catch (error) {
      res.status(error.message === "Health details not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteHealthDetails(req, res) {
    try {
      await healthDetailsService.deleteHealthDetails(req.params.id);
      res.status(200).json({
        success: true,
        message: "Health details deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "Health details not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new HealthDetailsController();