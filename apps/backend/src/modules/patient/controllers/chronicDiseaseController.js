import chronicDiseaseService from "../services/chronicDiseaseService.js";

class ChronicDiseaseController {
  async getAllChronicDiseases(req, res) {
    try {
      const chronicDiseases = await chronicDiseaseService.getAllChronicDiseases(req.query);
      res.status(200).json({
        success: true,
        data: chronicDiseases
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getChronicDiseaseById(req, res) {
    try {
      const chronicDisease = await chronicDiseaseService.getChronicDiseaseById(req.params.id);
      res.status(200).json({
        success: true,
        data: chronicDisease
      });
    } catch (error) {
      res.status(error.message === "ChronicDisease not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createChronicDisease(req, res) {
    try {
      const chronicDisease = await chronicDiseaseService.createChronicDisease(req.body);
      res.status(201).json({
        success: true,
        data: chronicDisease
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateChronicDisease(req, res) {
    try {
      const chronicDisease = await chronicDiseaseService.updateChronicDisease(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: chronicDisease
      });
    } catch (error) {
      res.status(error.message === "ChronicDisease not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteChronicDisease(req, res) {
    try {
      await chronicDiseaseService.deleteChronicDisease(req.params.id);
      res.status(200).json({
        success: true,
        message: "ChronicDisease deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "ChronicDisease not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new ChronicDiseaseController();