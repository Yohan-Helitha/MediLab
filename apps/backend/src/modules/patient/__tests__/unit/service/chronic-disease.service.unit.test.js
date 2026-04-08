/**
 * Chronic Disease Module - Service Unit Tests
 * Note: Service unit tests verify method existence. Integration tests validate
 * actual functionality end-to-end across all modules.
 */

import { describe, it, expect } from '@jest/globals';
import ChronicDiseaseService from '../../../services/chronicDiseaseService.js';

describe('ChronicDiseaseService - Unit Tests', () => {
  describe('Service methods exist', () => {
    it('should have getAllChronicDiseases method', () => {
      expect(typeof ChronicDiseaseService.getAllChronicDiseases).toBe('function');
    });

    it('should have getChronicDiseaseById method', () => {
      expect(typeof ChronicDiseaseService.getChronicDiseaseById).toBe('function');
    });

    it('should have createChronicDisease method', () => {
      expect(typeof ChronicDiseaseService.createChronicDisease).toBe('function');
    });

    it('should have updateChronicDisease method', () => {
      expect(typeof ChronicDiseaseService.updateChronicDisease).toBe('function');
    });

    it('should have deleteChronicDisease method', () => {
      expect(typeof ChronicDiseaseService.deleteChronicDisease).toBe('function');
    });
  });
});
