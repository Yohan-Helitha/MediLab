import pastMedicalHistoryService from "../services/pastMedicalHistoryService.js";

class PastMedicalHistoryController {
  async getAllPastMedicalHistories(req, res) {
    try {
      const pastMedicalHistories = await pastMedicalHistoryService.getAllPastMedicalHistories(req.query);
      res.status(200).json({
        success: true,
        data: pastMedicalHistories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPastMedicalHistoryById(req, res) {
    try {
      const pastMedicalHistory = await pastMedicalHistoryService.getPastMedicalHistoryById(req.params.id);
      res.status(200).json({
        success: true,
        data: pastMedicalHistory
      });
    } catch (error) {
      res.status(error.message === "PastMedicalHistory not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createPastMedicalHistory(req, res) {
    try {
      const pastMedicalHistory = await pastMedicalHistoryService.createPastMedicalHistory(req.body);
      res.status(201).json({
        success: true,
        data: pastMedicalHistory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updatePastMedicalHistory(req, res) {
    try {
      const pastMedicalHistory = await pastMedicalHistoryService.updatePastMedicalHistory(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: pastMedicalHistory
      });
    } catch (error) {
      res.status(error.message === "PastMedicalHistory not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deletePastMedicalHistory(req, res) {
    try {
      await pastMedicalHistoryService.deletePastMedicalHistory(req.params.id);
      res.status(200).json({
        success: true,
        message: "PastMedicalHistory deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "PastMedicalHistory not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new PastMedicalHistoryController();