import emergencyContactService from "../services/emergencyContactService.js";

class EmergencyContactController {
  async getAllEmergencyContacts(req, res) {
    try {
      const emergencyContacts = await emergencyContactService.getAllEmergencyContacts(req.query);
      res.status(200).json({
        success: true,
        data: emergencyContacts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEmergencyContactById(req, res) {
    try {
      const emergencyContact = await emergencyContactService.getEmergencyContactById(req.params.id);
      res.status(200).json({
        success: true,
        data: emergencyContact
      });
    } catch (error) {
      res.status(error.message === "Emergency contact not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createEmergencyContact(req, res) {
    try {
      const emergencyContact = await emergencyContactService.createEmergencyContact(req.body);
      res.status(201).json({
        success: true,
        data: emergencyContact
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateEmergencyContact(req, res) {
    try {
      const emergencyContact = await emergencyContactService.updateEmergencyContact(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: emergencyContact
      });
    } catch (error) {
      res.status(error.message === "Emergency contact not found" ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteEmergencyContact(req, res) {
    try {
      await emergencyContactService.deleteEmergencyContact(req.params.id);
      res.status(200).json({
        success: true,
        message: "Emergency contact deleted successfully"
      });
    } catch (error) {
      res.status(error.message === "Emergency contact not found" ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new EmergencyContactController();