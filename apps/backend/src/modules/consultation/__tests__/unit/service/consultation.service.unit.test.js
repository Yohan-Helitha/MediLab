/**
 * Consultation Module - Service Unit Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.unstable_mockModule('axios', () => ({
  default: jest.fn()
}));

const consultationService = (await import('../../../services/consultationService.js')).default;
const axios = (await import('axios')).default;

describe('ConsultationService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('askAIDoctor', () => {
    it('should send message to AI Doctor API', async () => {
      const mockResponse = {
        data: {
          answer: 'Based on your symptoms, you should consult a doctor.',
          specialization: 'general'
        }
      };

      axios.mockResolvedValue(mockResponse);

      const result = await consultationService.askAIDoctor('I have a headache', 'neurosurgery');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle API rate limit error', async () => {
      axios.mockRejectedValue({
        response: { status: 429 }
      });

      try {
        await consultationService.askAIDoctor('Test message');
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toContain('rate limit');
      }
    });

    it('should handle API authentication error', async () => {
      axios.mockRejectedValue({
        response: { status: 401 }
      });

      try {
        await consultationService.askAIDoctor('Test message');
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toContain('authentication failed');
      }
    });
  });
});
