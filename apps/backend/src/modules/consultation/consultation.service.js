import axios from 'axios';

class ConsultationService {
  constructor() {
    this.apiKey = process.env.RAPIDAPI_AI_DOCTOR_KEY;
    this.apiHost = process.env.RAPIDAPI_AI_DOCTOR_HOST;
    this.apiUrl = process.env.RAPIDAPI_AI_DOCTOR_URL;
  }

  /**
   * Send a message to the AI Doctor chatbot
   * @param {string} message - The medical question or symptom description
   * @param {string} specialization - Medical specialization (e.g., 'neurosurgery', 'cardiology', 'general')
   * @param {string} language - Language code (default: 'en')
   * @returns {Promise<Object>} AI Doctor response
   */
  async askAIDoctor(message, specialization = 'general', language = 'en') {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.apiUrl}/chat`,
        params: {
          noqueue: '1'
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost,
          'Content-Type': 'application/json'
        },
        data: {
          message,
          specialization,
          language
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI Doctor API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('API authentication failed. Please check your API key.');
      }

      throw new Error(error.response?.data?.message || 'Failed to get response from AI Doctor');
    }
  }

  /**
   * Get medical information about a specific condition
   * @param {string} condition - Medical condition to query
   * @param {string} specialization - Medical specialization
   * @returns {Promise<Object>} Medical information
   */
  async getMedicalInfo(condition, specialization = 'general') {
    const message = `What is ${condition}? Please provide detailed information including symptoms, causes, and treatment options.`;
    return await this.askAIDoctor(message, specialization, 'en');
  }

  /**
   * Analyze symptoms
   * @param {Array<string>} symptoms - List of symptoms
   * @param {Object} patientInfo - Additional patient information (age, gender, etc.)
   * @returns {Promise<Object>} Symptom analysis
   */
  async analyzeSymptoms(symptoms, patientInfo = {}) {
    const symptomsText = symptoms.join(', ');
    const patientContext = patientInfo.age && patientInfo.gender 
      ? `Patient is ${patientInfo.age} years old, ${patientInfo.gender}. `
      : '';
    
    const message = `${patientContext}Patient is experiencing the following symptoms: ${symptomsText}. What could be the possible conditions and what should they do?`;
    
    return await this.askAIDoctor(message, 'general', 'en');
  }

  /**
   * Get medication information
   * @param {string} medicationName - Name of the medication
   * @returns {Promise<Object>} Medication details
   */
  async getMedicationInfo(medicationName) {
    const message = `What is ${medicationName}? Please provide information about its uses, dosage, side effects, and precautions.`;
    return await this.askAIDoctor(message, 'pharmacy', 'en');
  }

  /**
   * Get lifestyle and prevention advice
   * @param {string} condition - Health condition or concern
   * @returns {Promise<Object>} Lifestyle advice
   */
  async getLifestyleAdvice(condition) {
    const message = `What lifestyle changes and prevention methods are recommended for ${condition}?`;
    return await this.askAIDoctor(message, 'general', 'en');
  }

  /**
   * Check API health
   * @returns {Promise<boolean>} True if API is accessible
   */
  async checkAPIHealth() {
    try {
      await this.askAIDoctor('Hello', 'general', 'en');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new ConsultationService();
