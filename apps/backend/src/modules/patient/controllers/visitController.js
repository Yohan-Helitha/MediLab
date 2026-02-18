import visitService from "../services/visitService.js";

class VisitController {
  async getAllVisits(req, res) {
    try {
      const visits = await visitService.getAllVisits(req.query);
      res.status(200).json({
        success: true,
        data: visits
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getVisitById(req, res) {
    try {
      const visit = await visitService.getVisitById(req.params.id);
      res.status(200).json({
        success: true,
        data: visit
      });
    } catch (error) {
      res.status(error.message === "Visit not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createVisit(req, res) {
    try {
      const visit = await visitService.createVisit(req.body);
      res.status(201).json({
        success: true,
        data: visit
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateVisit(req, res) {
    try {
      const visit = await visitService.updateVisit(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: visit
      });
    } catch (error) {
      res.status(error.message === "Visit not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteVisit(req, res) {
    try {
      await visitService.deleteVisit(req.params.id);
      res.status(200).json({
        success: true,
        message: "Visit deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "Visit not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new VisitController();