import medicationService from "../services/medicationService.js";

class MedicationController {
  async getAllMedications(req, res) {
    try {
      const medications = await medicationService.getAllMedications(req.query);
      res.status(200).json({
        success: true,
        data: medications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getMedicationById(req, res) {
    try {
      const medication = await medicationService.getMedicationById(req.params.id);
      res.status(200).json({
        success: true,
        data: medication
      });
    } catch (error) {
      res.status(error.message === "Medication not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createMedication(req, res) {
    try {
      const medication = await medicationService.createMedication(req.body);
      res.status(201).json({
        success: true,
        data: medication
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateMedication(req, res) {
    try {
      const medication = await medicationService.updateMedication(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: medication
      });
    } catch (error) {
      res.status(error.message === "Medication not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteMedication(req, res) {
    try {
      await medicationService.deleteMedication(req.params.id);
      res.status(200).json({
        success: true,
        message: "Medication deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "Medication not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new MedicationController();