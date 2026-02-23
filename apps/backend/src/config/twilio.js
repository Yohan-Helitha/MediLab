// Twilio SMS Service Integration
// Handles SMS sending for patient notifications

import twilio from "twilio";
import config from "./environment.js";

// Initialize Twilio client
let twilioClient = null;

// Check if Twilio credentials are configured
const isTwilioConfigured = () => {
  return (
    config.twilio.accountSid &&
    config.twilio.authToken &&
    config.twilio.phoneNumber
  );
};

// Initialize client only if credentials are available
if (isTwilioConfigured()) {
  twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
  console.log("✅ Twilio SMS service initialized");
} else {
  console.warn(
    "⚠️  Twilio credentials not configured. SMS notifications will not be sent.",
  );
}

/**
 * Send SMS message via Twilio
 * @param {string} to - Recipient phone number (E.164 format: +1234567890)
 * @param {string} message - SMS message body (max 1600 characters)
 * @returns {Promise<Object>} { success: boolean, sid?: string, error?: string }
 */
export const sendSMS = async (to, message) => {
  // Check if Twilio is configured
  if (!isTwilioConfigured()) {
    console.warn("SMS not sent: Twilio credentials not configured");
    return {
      success: false,
      error: "Twilio credentials not configured",
      provider: "twilio",
    };
  }

  // Validate inputs
  if (!to || !message) {
    return {
      success: false,
      error: "Recipient phone number and message are required",
      provider: "twilio",
    };
  }

  // Validate phone number format (basic check)
  if (!to.startsWith("+")) {
    return {
      success: false,
      error: "Phone number must be in E.164 format (e.g., +94771234567)",
      provider: "twilio",
    };
  }

  // Validate message length
  if (message.length > 1600) {
    return {
      success: false,
      error: "Message exceeds maximum length of 1600 characters",
      provider: "twilio",
    };
  }

  try {
    // Send SMS via Twilio
    const response = await twilioClient.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to: to,
    });

    console.log(`✅ SMS sent successfully: ${response.sid}`);

    return {
      success: true,
      sid: response.sid,
      status: response.status,
      to: response.to,
      provider: "twilio",
      dateSent: response.dateCreated,
    };
  } catch (error) {
    console.error("❌ Twilio SMS error:", error.message);

    // Parse Twilio error
    const errorMessage =
      error.code === 21211
        ? "Invalid phone number"
        : error.code === 21608
          ? "Phone number is not verified (Twilio trial account)"
          : error.message;

    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
      provider: "twilio",
    };
  }
};

/**
 * Send SMS with retry logic
 * @param {string} to - Recipient phone number
 * @param {string} message - SMS message body
 * @param {number} retries - Number of retry attempts (default: 1)
 * @returns {Promise<Object>} Result of SMS sending
 */
export const sendSMSWithRetry = async (to, message, retries = 1) => {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await sendSMS(to, message);

    if (result.success) {
      if (attempt > 0) {
        console.log(`✅ SMS sent successfully on retry attempt ${attempt}`);
      }
      return result;
    }

    lastError = result;

    // Don't retry on validation errors
    if (
      result.error?.includes("required") ||
      result.error?.includes("format") ||
      result.error?.includes("maximum length")
    ) {
      break;
    }

    // Wait before retry (exponential backoff)
    if (attempt < retries) {
      const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, etc.
      console.log(`⏳ Retrying SMS in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  return lastError;
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid E.164 format
 */
export const isValidPhoneNumber = (phoneNumber) => {
  // E.164 format: +[country code][number]
  // Example: +94771234567, +14155551234
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
};

/**
 * Format phone number to E.164 format for Sri Lanka
 * @param {string} phoneNumber - Phone number (e.g., 0771234567 or 771234567)
 * @returns {string} Formatted phone number (+94771234567)
 */
export const formatPhoneNumberSriLanka = (phoneNumber) => {
  // Remove spaces, dashes, and other non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // Remove leading zero if present
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Add country code for Sri Lanka (+94)
  if (!cleaned.startsWith("94")) {
    cleaned = "94" + cleaned;
  }

  return "+" + cleaned;
};

export default {
  sendSMS,
  sendSMSWithRetry,
  isValidPhoneNumber,
  formatPhoneNumberSriLanka,
  isTwilioConfigured,
};
