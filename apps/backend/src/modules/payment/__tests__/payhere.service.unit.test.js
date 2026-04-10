/**
 * Run this test file with:
 * npm test -- src/modules/payment/__tests__/payhere.service.unit.test.js
 */

import { describe, it, expect } from '@jest/globals';
import crypto from 'crypto';

import {
  md5HexUpper,
  formatAmount,
  generateCheckoutHash,
  validateNotifySignature,
} from '../payhere.service.js';

function md5Upper(value) {
  return crypto.createHash('md5').update(String(value), 'utf8').digest('hex').toUpperCase();
}

describe('payhere.service', () => {
  describe('md5HexUpper()', () => {
    it('returns uppercase MD5 hex', () => {
      expect(md5HexUpper('abc')).toBe('900150983CD24FB0D6963F7D28E17F72');
    });
  });

  describe('formatAmount()', () => {
    it('formats numbers to 2 decimals', () => {
      expect(formatAmount(1500)).toBe('1500.00');
      expect(formatAmount(12.3)).toBe('12.30');
      expect(formatAmount('99.999')).toBe('100.00');
    });

    it('throws on invalid amount', () => {
      expect(() => formatAmount('nope')).toThrow('Invalid amount');
    });
  });

  describe('generateCheckoutHash()', () => {
    it('generates MD5 signature using the PayHere formula', () => {
      const merchantId = 'MID-TEST';
      const merchantSecret = 'SECRET-TEST';
      const orderId = 'ORDER-1';
      const amount = 1500;
      const currency = 'LKR';

      const secretHash = md5Upper(merchantSecret);
      const raw = `${merchantId}${orderId}${formatAmount(amount)}${currency}${secretHash}`;
      const expected = md5Upper(raw);

      const actual = generateCheckoutHash({
        merchantId,
        merchantSecret,
        orderId,
        amount,
        currency,
      });

      expect(actual).toBe(expected);
    });

    it('throws when credentials are missing', () => {
      expect(() =>
        generateCheckoutHash({
          merchantId: '',
          merchantSecret: '',
          orderId: '1',
          amount: 1,
          currency: 'LKR',
        }),
      ).toThrow('Missing PayHere merchant credentials');
    });
  });

  describe('validateNotifySignature()', () => {
    it('returns true when md5sig matches expected', () => {
      const merchantId = 'MID-TEST';
      const merchantSecret = 'SECRET-TEST';
      const orderId = 'ORDER-1';
      const payhereAmount = '1500.00';
      const payhereCurrency = 'LKR';
      const statusCode = '2';

      const secretHash = md5Upper(merchantSecret);
      const raw = `${merchantId}${orderId}${formatAmount(payhereAmount)}${payhereCurrency}${statusCode}${secretHash}`;
      const md5sig = md5Upper(raw);

      expect(
        validateNotifySignature({
          merchantId,
          merchantSecret,
          orderId,
          payhereAmount,
          payhereCurrency,
          statusCode,
          md5sig,
        }),
      ).toBe(true);
    });

    it('returns false when md5sig does not match', () => {
      expect(
        validateNotifySignature({
          merchantId: 'MID-TEST',
          merchantSecret: 'SECRET-TEST',
          orderId: 'ORDER-1',
          payhereAmount: '1500.00',
          payhereCurrency: 'LKR',
          statusCode: '2',
          md5sig: 'BAD',
        }),
      ).toBe(false);
    });
  });
});
