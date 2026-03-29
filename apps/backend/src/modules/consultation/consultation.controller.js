import consultationService from './consultation.service.js';

class ConsultationController {
  /**
   * Ask AI Doctor a medical question
   * POST /api/consultation/ask
   */
  async askAIDoctor(req, res) {
    try {
      const { message, specialization, language } = req.body;

      const result = await consultationService.askAIDoctor(
        message,
        specialization || 'general',
        language || 'en'
      );

      res.status(200).json({
        success: true,
        message: 'AI Doctor response received',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get medical information about a condition
   * POST /api/consultation/medical-info
   */
  async getMedicalInfo(req, res) {
    try {
      const { condition, specialization } = req.body;

      const result = await consultationService.getMedicalInfo(
        condition,
        specialization || 'general'
      );

      res.status(200).json({
        success: true,
        message: 'Medical information retrieved',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Analyze patient symptoms
   * POST /api/consultation/analyze-symptoms
   */
  async analyzeSymptoms(req, res) {
    try {
      const { symptoms, patientInfo } = req.body;

      if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one symptom'
        });
      }

      const result = await consultationService.analyzeSymptoms(symptoms, patientInfo);

      res.status(200).json({
        success: true,
        message: 'Symptoms analyzed',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get medication information
   * POST /api/consultation/medication-info
   */
  async getMedicationInfo(req, res) {
    try {
      const { medicationName } = req.body;

      const result = await consultationService.getMedicationInfo(medicationName);

      res.status(200).json({
        success: true,
        message: 'Medication information retrieved',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get lifestyle and prevention advice
   * POST /api/consultation/lifestyle-advice
   */
  async getLifestyleAdvice(req, res) {
    try {
      const { condition } = req.body;

      const result = await consultationService.getLifestyleAdvice(condition);

      res.status(200).json({
        success: true,
        message: 'Lifestyle advice retrieved',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Check AI Doctor API health
   * GET /api/consultation/health
   */
  async checkHealth(req, res) {
    try {
      const isHealthy = await consultationService.checkAPIHealth();

      res.status(200).json({
        success: true,
        message: isHealthy ? 'AI Doctor API is operational' : 'AI Doctor API is not responding',
        data: {
          status: isHealthy ? 'online' : 'offline'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new ConsultationController();
