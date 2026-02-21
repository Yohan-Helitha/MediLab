// SendGrid Email Service Integration
// Handles email sending for patient notifications

import sgMail from "@sendgrid/mail";
import config from "./environment.js";

// Check if SendGrid is configured
const isSendGridConfigured = () => {
  return config.sendgrid.apiKey && config.sendgrid.fromEmail;
};

// Initialize SendGrid with API key
if (isSendGridConfigured()) {
  sgMail.setApiKey(config.sendgrid.apiKey);
  console.log("✅ SendGrid email service initialized");
} else {
  console.warn(
    "⚠️  SendGrid credentials not configured. Email notifications will not be sent.",
  );
}

/**
 * Send email via SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 * @param {string} text - Plain text email body (optional, auto-generated from HTML if not provided)
 * @returns {Promise<Object>} { success: boolean, messageId?: string, error?: string }
 */
export const sendEmail = async (to, subject, html, text = null) => {
  // Check if SendGrid is configured
  if (!isSendGridConfigured()) {
    console.warn("Email not sent: SendGrid credentials not configured");
    return {
      success: false,
      error: "SendGrid credentials not configured",
      provider: "sendgrid",
    };
  }

  // Validate inputs
  if (!to || !subject || !html) {
    return {
      success: false,
      error: "Recipient email, subject, and HTML body are required",
      provider: "sendgrid",
    };
  }

  // Validate email format
  if (!isValidEmail(to)) {
    return {
      success: false,
      error: "Invalid email address format",
      provider: "sendgrid",
    };
  }

  // Prepare email message
  const msg = {
    to: to,
    from: {
      email: config.sendgrid.fromEmail,
      name: config.sendgrid.fromName || "MediLab",
    },
    subject: subject,
    html: html,
    text: text || stripHtmlTags(html), // Auto-generate plain text if not provided
  };

  try {
    // Send email via SendGrid
    const response = await sgMail.send(msg);

    console.log(`✅ Email sent successfully to: ${to}`);

    return {
      success: true,
      messageId: response[0].headers["x-message-id"],
      statusCode: response[0].statusCode,
      to: to,
      provider: "sendgrid",
    };
  } catch (error) {
    console.error("❌ SendGrid email error:", error.message);

    // Parse SendGrid error
    const errorMessage =
      error.code === 403
        ? "SendGrid API key is invalid or suspended"
        : error.code === 400
          ? "Invalid email data"
          : error.message;

    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
      provider: "sendgrid",
    };
  }
};

/**
 * Send email with retry logic
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 * @param {string} text - Plain text body (optional)
 * @param {number} retries - Number of retry attempts (default: 1)
 * @returns {Promise<Object>} Result of email sending
 */
export const sendEmailWithRetry = async (
  to,
  subject,
  html,
  text = null,
  retries = 1,
) => {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await sendEmail(to, subject, html, text);

    if (result.success) {
      if (attempt > 0) {
        console.log(`✅ Email sent successfully on retry attempt ${attempt}`);
      }
      return result;
    }

    lastError = result;

    // Don't retry on validation errors or auth errors
    if (
      result.error?.includes("required") ||
      result.error?.includes("Invalid") ||
      result.error?.includes("invalid")
    ) {
      break;
    }

    // Wait before retry (exponential backoff)
    if (attempt < retries) {
      const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, etc.
      console.log(`⏳ Retrying email in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  return lastError;
};

/**
 * Send test result ready notification email
 * @param {Object} data - Email data { patientName, testName, testDate, centerName, loginUrl }
 * @returns {Promise<Object>} Result of email sending
 */
export const sendResultReadyEmail = async (data) => {
  const { to, patientName, testName, testDate, centerName, loginUrl } = data;

  const subject = "Your Test Results are Ready - MediLab";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .button { display: inline-block; padding: 12px 30px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
    .details { background-color: white; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 MediLab Rural Health System</h1>
    </div>
    <div class="content">
      <h2>Dear ${patientName},</h2>
      <p>Your test results are now ready for viewing!</p>
      
      <div class="details">
        <p><strong>Test:</strong> ${testName}</p>
        <p><strong>Date Conducted:</strong> ${testDate}</p>
        <p><strong>Health Center:</strong> ${centerName}</p>
      </div>
      
      <p>Please login to your account to view and download your complete test report:</p>
      
      <p style="text-align: center;">
        <a href="${loginUrl}" class="button">View My Results</a>
      </p>
      
      <p>If you have any questions about your results, please contact your health center.</p>
      
      <p>Stay healthy!</p>
      <p><strong>MediLab Rural Health System</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated notification. Please do not reply to this email.</p>
      <p>© 2026 MediLab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return await sendEmailWithRetry(to, subject, html);
};

/**
 * Send routine checkup reminder email
 * @param {Object} data - Email data { patientName, testName, lastTestDate, bookingUrl, unsubscribeUrl }
 * @returns {Promise<Object>} Result of email sending
 */
export const sendRoutineCheckupReminderEmail = async (data) => {
  const {
    to,
    patientName,
    testName,
    lastTestDate,
    bookingUrl,
    unsubscribeUrl,
  } = data;

  const subject = `Routine Checkup Reminder - ${testName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .button { display: inline-block; padding: 12px 30px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
    .reminder-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #f39c12; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Health Reminder</h1>
    </div>
    <div class="content">
      <h2>Dear ${patientName},</h2>
      <p>This is a friendly reminder for your routine <strong>${testName}</strong> checkup.</p>
      
      <div class="reminder-box">
        <p><strong>📅 Last Test Date:</strong> ${lastTestDate}</p>
        <p>Regular monitoring is important for maintaining good health and early detection of potential issues.</p>
      </div>
      
      <p>Please book an appointment at your nearest health center through our app:</p>
      
      <p style="text-align: center;">
        <a href="${bookingUrl}" class="button">Book Appointment</a>
      </p>
      
      <p>If you've already completed this test or would like to stop receiving these reminders, you can unsubscribe below.</p>
      
      <p style="text-align: center; font-size: 12px;">
        <a href="${unsubscribeUrl}" style="color: #777;">Unsubscribe from reminders</a>
      </p>
      
      <p>Stay healthy!</p>
      <p><strong>MediLab Rural Health System</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated reminder. Please do not reply to this email.</p>
      <p>© 2026 MediLab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return await sendEmailWithRetry(to, subject, html);
};

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Strip HTML tags from string (for plain text email)
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
const stripHtmlTags = (html) => {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, "")
    .replace(/<[^>]+>/gm, "")
    .replace(/\s+/g, " ")
    .trim();
};

export default {
  sendEmail,
  sendEmailWithRetry,
  sendResultReadyEmail,
  sendRoutineCheckupReminderEmail,
  isValidEmail,
  isSendGridConfigured,
};
