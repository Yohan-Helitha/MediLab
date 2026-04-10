/**
 * Patient Module - Member Service Unit Tests
 * Note: Comprehensive integration tests validate service functionality.
 * Service unit tests verify the service can be imported and has required methods.
 */

import { describe, it, expect } from '@jest/globals';
import MemberService from '../../../services/memberService.js';

describe('MemberService - Unit Tests', () => {
  describe('Service Methods', () => {
    it('should have getAllMembers method', () => {
      expect(typeof MemberService.getAllMembers).toBe('function');
    });

    it('should have getMemberById method', () => {
      expect(typeof MemberService.getMemberById).toBe('function');
    });

    it('should have createMember method', () => {
      expect(typeof MemberService.createMember).toBe('function');
    });

    it('should have updateMember method', () => {
      expect(typeof MemberService.updateMember).toBe('function');
    });

    it('should have deleteMember method', () => {
      expect(typeof MemberService.deleteMember).toBe('function');
    });
  });
});
