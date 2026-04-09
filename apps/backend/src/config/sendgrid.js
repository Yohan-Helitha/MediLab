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
    // SendGrid errors are wrapped — actual detail is in error.response.body.errors
    const statusCode = error.response?.status || error.code;
    const sgErrors = error.response?.body?.errors;
    const sgErrorMessage = sgErrors?.[0]?.message || null;

    console.error(
      `❌ SendGrid email error [HTTP ${statusCode}]:`,
      sgErrorMessage || error.message,
    );
    if (sgErrors) {
      console.error("SendGrid error details:", JSON.stringify(sgErrors));
    }

    // Human-readable error messages based on HTTP status
    let errorMessage;
    if (statusCode === 401) {
      errorMessage =
        "SendGrid API key is invalid or missing — check SENDGRID_API_KEY in .env";
    } else if (statusCode === 403) {
      errorMessage =
        "SendGrid sender not authorized — verify SENDGRID_FROM_EMAIL in Single Sender Verification on SendGrid dashboard";
    } else if (statusCode === 400) {
      errorMessage =
        sgErrorMessage || "Invalid email data — check to/subject/html fields";
    } else if (statusCode === 429) {
      errorMessage =
        "SendGrid rate limit exceeded — free tier is 100 emails/day";
    } else {
      errorMessage = sgErrorMessage || error.message;
    }

    return {
      success: false,
      error: errorMessage,
      errorCode: statusCode,
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
 * Send unviewed result reminder email
 * @param {Object} data - Email data { to, patientName, testName, releasedDate, daysUnviewed, loginUrl }
 * @returns {Promise<Object>} Result of email sending
 */
export const sendUnviewedResultReminderEmail = async (data) => {
  const { to, patientName, testName, releasedDate, daysUnviewed, loginUrl } =
    data;

  const subject = "Reminder: Your Test Results are Still Unviewed - MediLab";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .button { display: inline-block; padding: 12px 30px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
    .warning-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .details { background-color: white; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ MediLab Rural Health System</h1>
    </div>
    <div class="content">
      <h2>Dear ${patientName},</h2>
      
      <div class="warning-box">
        <p><strong>⚠️ Important Reminder:</strong></p>
        <p>Your test results have been available for <strong>${daysUnviewed} days</strong> but have not been viewed yet.</p>
      </div>
      
      <p>We noticed that you haven't checked your test results. Your health is important to us, and reviewing your results is an essential part of your healthcare.</p>
      
      <div class="details">
        <p><strong>Test:</strong> ${testName}</p>
        <p><strong>Released Date:</strong> ${releasedDate}</p>
        <p><strong>Days Unviewed:</strong> ${daysUnviewed} days</p>
      </div>
      
      <p>Please take a moment to login and review your test results:</p>
      
      <p style="text-align: center;">
        <a href="${loginUrl}" class="button">View My Results Now</a>
      </p>
      
      <p>If you have concerns or questions about your results, please contact your healthcare provider or visit your health center.</p>
      
      <p>Your health matters!</p>
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
 * Send hard copy ready for pickup notification email
 * @param {Object} data - Email data { to, patientName, testName, centerName, centerAddress, bookingCode, operatingHours, centerPhone, loginUrl }
 * @returns {Promise<Object>} Result of email sending
 */
export const sendHardCopyReadyEmail = async (data) => {
  const {
    to,
    patientName,
    testName,
    centerName,
    centerAddress,
    bookingCode,
    operatingHours,
    centerPhone,
    loginUrl,
  } = data;

  const subject = "Your Hard Copy Report is Ready for Pickup - MediLab";

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
    .details { background-color: white; padding: 15px; border-left: 4px solid #27ae60; margin: 20px 0; }
    .pickup-box { background-color: #eafaf1; padding: 15px; border-left: 4px solid #27ae60; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 MediLab Rural Health System</h1>
    </div>
    <div class="content">
      <h2>Dear ${patientName},</h2>

      <p>Your printed hard copy report is ready for pickup at the health center.</p>

      <div class="details">
        <p><strong>Test:</strong> ${testName}</p>
        <p><strong>Booking Reference:</strong> ${bookingCode || "N/A"}</p>
      </div>

      <div class="pickup-box">
        <p><strong>📍 Pickup Location:</strong></p>
        <p><strong>${centerName}</strong></p>
        ${centerAddress ? `<p>${centerAddress}</p>` : ""}
        ${centerPhone ? `<p>📞 ${centerPhone}</p>` : ""}
        ${operatingHours ? `<p>🕐 Operating Hours: ${operatingHours}</p>` : ""}
      </div>

      <p>Please bring a valid ID when collecting your report. You can also view your results online by logging into your account.</p>

      <p style="text-align: center;">
        <a href="${loginUrl}" class="button">View My Results Online</a>
      </p>

      <p>If you have any questions, please contact the health center directly.</p>

      <p>Thank you for using <strong>MediLab Rural Health System</strong>.</p>
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
  sendUnviewedResultReminderEmail,
  sendHardCopyReadyEmail,
  isValidEmail,
  isSendGridConfigured,
};
