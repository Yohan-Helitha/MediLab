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

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;" bgcolor="#f0f4f8">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 10px;">
<table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;" bgcolor="#ffffff">
<tr><td align="center" bgcolor="#1e3a6e" style="background-color:#1e3a6e;padding:28px 24px;">
  <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:28px;color:#ffffff;">&#x2713;</p>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;">MediLab Rural Health System</p>
  <p style="margin:5px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#a8c4e0;">Test Result Notification</p>
</td></tr>
<tr><td style="padding:28px 30px;">
  <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;color:#1e3a6e;">Dear ${patientName},</p>
  <p style="margin:0 0 20px 0;font-family:Arial,sans-serif;font-size:14px;color:#4a5568;line-height:1.6;">Your test results have been reviewed and released by your health center. You may now view and download your complete report by logging into your account.</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;border-left:4px solid #2b6cb0;background-color:#f7fafc;" bgcolor="#f7fafc">
    <tr>
      <td width="38%" valign="top" style="padding:9px 8px 9px 14px;font-family:Arial,sans-serif;font-size:13px;color:#718096;border-bottom:1px solid #e2e8f0;">Test</td>
      <td width="62%" valign="top" style="padding:9px 14px 9px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#2d3748;border-bottom:1px solid #e2e8f0;">${testName}</td>
    </tr>
    <tr>
      <td width="38%" valign="top" style="padding:9px 8px 9px 14px;font-family:Arial,sans-serif;font-size:13px;color:#718096;border-bottom:1px solid #e2e8f0;">Date Conducted</td>
      <td width="62%" valign="top" style="padding:9px 14px 9px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#2d3748;border-bottom:1px solid #e2e8f0;">${testDate}</td>
    </tr>
    <tr>
      <td width="38%" valign="top" style="padding:9px 8px 9px 14px;font-family:Arial,sans-serif;font-size:13px;color:#718096;">Health Center</td>
      <td width="62%" valign="top" style="padding:9px 14px 9px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#2d3748;">${centerName}</td>
    </tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr><td align="center" style="padding:16px 0;">
      <a href="${loginUrl}" style="display:inline-block;padding:13px 32px;background-color:#2b6cb0;color:#ffffff;text-decoration:none;border-radius:5px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">View My Results</a>
    </td></tr>
  </table>
  <p style="margin:0;border-top:1px solid #e2e8f0;padding-top:16px;font-family:Arial,sans-serif;font-size:13px;color:#718096;line-height:1.5;">If you have any questions about your results, please contact your health center directly. Do not reply to this email.</p>
</td></tr>
<tr><td align="center" bgcolor="#f7fafc" style="background-color:#f7fafc;padding:16px 24px;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#a0aec0;">MediLab Rural Health System &mdash; <a href="https://medilab.dev" style="color:#718096;text-decoration:none;">medilab.dev</a></p>
  <p style="margin:3px 0 0 0;font-family:Arial,sans-serif;font-size:11px;color:#a0aec0;">&copy; 2026 MediLab. All rights reserved.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

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

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;" bgcolor="#f0f4f8">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 10px;">
<table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;" bgcolor="#ffffff">
<tr><td align="center" bgcolor="#1a4731" style="background-color:#1a4731;padding:28px 24px;">
  <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:28px;color:#ffffff;">&#x25CB;</p>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;">MediLab Rural Health System</p>
  <p style="margin:5px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#9ae6b4;">Routine Health Reminder</p>
</td></tr>
<tr><td style="padding:28px 30px;">
  <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;color:#1a4731;">Dear ${patientName},</p>
  <p style="margin:0 0 20px 0;font-family:Arial,sans-serif;font-size:14px;color:#4a5568;line-height:1.6;">This is a scheduled reminder for your routine <strong style="color:#1a4731;">${testName}</strong> checkup. Regular monitoring plays an important role in early detection and maintaining your overall health.</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;border-left:4px solid #38a169;background-color:#f0fff4;" bgcolor="#f0fff4">
    <tr><td colspan="2" style="padding:9px 14px 4px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#38a169;">Checkup Details</td></tr>
    <tr>
      <td width="38%" valign="top" style="padding:6px 8px 6px 14px;font-family:Arial,sans-serif;font-size:13px;color:#718096;border-bottom:1px solid #c6f6d5;">Test</td>
      <td width="62%" valign="top" style="padding:6px 14px 6px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#2d3748;border-bottom:1px solid #c6f6d5;">${testName}</td>
    </tr>
    <tr>
      <td width="38%" valign="top" style="padding:6px 8px 10px 14px;font-family:Arial,sans-serif;font-size:13px;color:#718096;">Last Conducted</td>
      <td width="62%" valign="top" style="padding:6px 14px 10px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#2d3748;">${lastTestDate}</td>
    </tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr><td align="center" style="padding:16px 0;">
      <a href="${bookingUrl}" style="display:inline-block;padding:13px 32px;background-color:#38a169;color:#ffffff;text-decoration:none;border-radius:5px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Book an Appointment</a>
    </td></tr>
  </table>
  <p style="margin:0 0 12px 0;border-top:1px solid #e2e8f0;padding-top:16px;font-family:Arial,sans-serif;font-size:13px;color:#718096;line-height:1.5;">If you have already completed this test recently, you may disregard this reminder. To stop receiving these reminders, click the link below.</p>
  <p style="margin:0;text-align:center;"><a href="${unsubscribeUrl}" style="font-family:Arial,sans-serif;font-size:12px;color:#718096;">Unsubscribe from routine reminders</a></p>
</td></tr>
<tr><td align="center" bgcolor="#f7fafc" style="background-color:#f7fafc;padding:16px 24px;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#a0aec0;">MediLab Rural Health System &mdash; <a href="https://medilab.dev" style="color:#718096;text-decoration:none;">medilab.dev</a></p>
  <p style="margin:3px 0 0 0;font-family:Arial,sans-serif;font-size:11px;color:#a0aec0;">&copy; 2026 MediLab. All rights reserved.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

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

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;" bgcolor="#f0f4f8">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 10px;">
<table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;" bgcolor="#ffffff">
<tr><td align="center" bgcolor="#742a2a" style="background-color:#742a2a;padding:28px 24px;">
  <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:28px;font-weight:bold;color:#ffffff;">!</p>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;">MediLab Rural Health System</p>
  <p style="margin:5px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#feb2b2;">Unviewed Results Reminder</p>
</td></tr>
<tr><td style="padding:28px 30px;">
  <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;color:#742a2a;">Dear ${patientName},</p>
  <p style="margin:0 0 20px 0;font-family:Arial,sans-serif;font-size:14px;color:#4a5568;line-height:1.6;">Your test results have been available for <strong style="color:#742a2a;">${daysUnviewed} day(s)</strong> and have not yet been viewed. Reviewing your results is an important step in your ongoing healthcare.</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;border-left:4px solid #c53030;background-color:#fff5f5;" bgcolor="#fff5f5">
    <tr><td style="padding:9px 14px 4px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#c53030;">Action Required</td></tr>
    <tr><td style="padding:0 14px 12px 14px;font-family:Arial,sans-serif;font-size:13px;color:#742a2a;line-height:1.5;">Your results have been waiting for ${daysUnviewed} day(s). Please log in to review them at your earliest convenience.</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;border-left:4px solid #718096;background-color:#f7fafc;" bgcolor="#f7fafc">
    <tr>
      <td width="38%" valign="top" style="padding:9px 8px 9px 14px;font-family:Arial,sans-serif;font-size:13px;color:#718096;border-bottom:1px solid #e2e8f0;">Test</td>
      <td width="62%" valign="top" style="padding:9px 14px 9px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#2d3748;border-bottom:1px solid #e2e8f0;">${testName}</td>
    </tr>
    <tr>
      <td width="38%" valign="top" style="padding:9px 8px 9px 14px;font-family:Arial,sans-serif;font-size:13px;color:#718096;border-bottom:1px solid #e2e8f0;">Released Date</td>
      <td width="62%" valign="top" style="padding:9px 14px 9px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#2d3748;border-bottom:1px solid #e2e8f0;">${releasedDate}</td>
    </tr>
    <tr>
      <td width="38%" valign="top" style="padding:9px 8px 9px 14px;font-family:Arial,sans-serif;font-size:13px;color:#718096;">Days Unviewed</td>
      <td width="62%" valign="top" style="padding:9px 14px 9px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#2d3748;">${daysUnviewed} day(s)</td>
    </tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr><td align="center" style="padding:16px 0;">
      <a href="${loginUrl}" style="display:inline-block;padding:13px 32px;background-color:#c53030;color:#ffffff;text-decoration:none;border-radius:5px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">View My Results Now</a>
    </td></tr>
  </table>
  <p style="margin:0;border-top:1px solid #e2e8f0;padding-top:16px;font-family:Arial,sans-serif;font-size:13px;color:#718096;line-height:1.5;">If you have concerns about your results, please contact your health center. Do not reply to this email.</p>
</td></tr>
<tr><td align="center" bgcolor="#f7fafc" style="background-color:#f7fafc;padding:16px 24px;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#a0aec0;">MediLab Rural Health System &mdash; <a href="https://medilab.dev" style="color:#718096;text-decoration:none;">medilab.dev</a></p>
  <p style="margin:3px 0 0 0;font-family:Arial,sans-serif;font-size:11px;color:#a0aec0;">&copy; 2026 MediLab. All rights reserved.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

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

  const subject = "Your Hard Copy Report is Ready for Collection - MediLab";

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;" bgcolor="#f0f4f8">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 10px;">
<table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;" bgcolor="#ffffff">
<tr><td align="center" bgcolor="#1e3a6e" style="background-color:#1e3a6e;padding:28px 24px;">
  <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:28px;color:#ffffff;">&#x2393;</p>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;">MediLab Rural Health System</p>
  <p style="margin:5px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#a8c4e0;">Hard Copy Report Ready</p>
</td></tr>
<tr><td style="padding:28px 30px;">
  <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;color:#1e3a6e;">Dear ${patientName},</p>
  <p style="margin:0 0 20px 0;font-family:Arial,sans-serif;font-size:14px;color:#4a5568;line-height:1.6;">Your printed hard copy report is ready and available for collection at the health center.</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;border-left:4px solid #2b6cb0;background-color:#f7fafc;" bgcolor="#f7fafc">
    <tr>
      <td width="38%" valign="top" style="padding:9px 8px 9px 14px;font-family:Arial,sans-serif;font-size:13px;color:#718096;border-bottom:1px solid #e2e8f0;">Test</td>
      <td width="62%" valign="top" style="padding:9px 14px 9px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#2d3748;border-bottom:1px solid #e2e8f0;">${testName}</td>
    </tr>
    ${bookingCode ? `<tr><td width="38%" valign="top" style="padding:9px 8px 9px 14px;font-family:Arial,sans-serif;font-size:13px;color:#718096;">Booking Reference</td><td width="62%" valign="top" style="padding:9px 14px 9px 0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#2d3748;">${bookingCode}</td></tr>` : ""}
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;border-left:4px solid #3182ce;background-color:#ebf8ff;" bgcolor="#ebf8ff">
    <tr><td style="padding:9px 14px 4px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#2b6cb0;">Collection Details</td></tr>
    <tr><td style="padding:4px 14px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#1e3a6e;">${centerName}</td></tr>
    ${centerAddress ? `<tr><td style="padding:3px 14px;font-family:Arial,sans-serif;font-size:13px;color:#4a5568;">${centerAddress}</td></tr>` : ""}
    ${centerPhone ? `<tr><td style="padding:3px 14px;font-family:Arial,sans-serif;font-size:13px;color:#4a5568;">Tel: ${centerPhone}</td></tr>` : ""}
    ${operatingHours ? `<tr><td style="padding:3px 14px;font-family:Arial,sans-serif;font-size:13px;color:#4a5568;">Hours: ${operatingHours}</td></tr>` : ""}
    <tr><td style="padding:0 0 8px 0;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;background-color:#fffbeb;border:1px solid #f6e05e;" bgcolor="#fffbeb">
    <tr><td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;color:#744210;">Please bring a valid government-issued ID when collecting your report.</td></tr>
  </table>
  <p style="margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:14px;color:#4a5568;">You may also view and download your results online by logging into your account.</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr><td align="center" style="padding:8px 0 16px 0;">
      <a href="${loginUrl}" style="display:inline-block;padding:13px 32px;background-color:#2b6cb0;color:#ffffff;text-decoration:none;border-radius:5px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">View Results Online</a>
    </td></tr>
  </table>
  <p style="margin:0;border-top:1px solid #e2e8f0;padding-top:16px;font-family:Arial,sans-serif;font-size:13px;color:#718096;line-height:1.5;">If you have any questions, please contact the health center directly. Do not reply to this email.</p>
</td></tr>
<tr><td align="center" bgcolor="#f7fafc" style="background-color:#f7fafc;padding:16px 24px;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#a0aec0;">MediLab Rural Health System &mdash; <a href="https://medilab.dev" style="color:#718096;text-decoration:none;">medilab.dev</a></p>
  <p style="margin:3px 0 0 0;font-family:Arial,sans-serif;font-size:11px;color:#a0aec0;">&copy; 2026 MediLab. All rights reserved.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  return await sendEmailWithRetry(to, subject, html);
};

/**
 * Send hard copy collection reminder email (report has been waiting, not yet collected)
 * @param {Object} data - { to, patientName, testName, centerName, centerAddress, daysSincePrinting, centerPhone, operatingHours, loginUrl }
 * @returns {Promise<Object>} Result of email sending
 */
export const sendHardCopyCollectionReminderEmail = async (data) => {
  const {
    to,
    patientName,
    testName,
    centerName,
    centerAddress,
    daysSincePrinting,
    centerPhone,
    operatingHours,
    loginUrl,
  } = data;

  const subject = "Reminder: Your Hard Copy Report Awaits Collection - MediLab";

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;" bgcolor="#f0f4f8">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 10px;">
<table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;" bgcolor="#ffffff">
<tr><td align="center" bgcolor="#7b4b00" style="background-color:#7b4b00;padding:28px 24px;">
  <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:28px;font-weight:bold;color:#ffffff;">!</p>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;">MediLab Rural Health System</p>
  <p style="margin:5px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#fbd38d;">Hard Copy Collection Reminder</p>
</td></tr>
<tr><td style="padding:28px 30px;">
  <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;color:#7b4b00;">Dear ${patientName},</p>
  <p style="margin:0 0 20px 0;font-family:Arial,sans-serif;font-size:14px;color:#4a5568;line-height:1.6;">This is a reminder that your <strong style="color:#7b4b00;">${testName}</strong> hard copy report has been available for collection for <strong style="color:#7b4b00;">${daysSincePrinting} day(s)</strong> and has not yet been collected.</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;border-left:4px solid #c05621;background-color:#fffaf0;" bgcolor="#fffaf0">
    <tr><td style="padding:9px 14px 4px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#c05621;">Awaiting Collection</td></tr>
    <tr><td style="padding:0 14px 12px 14px;font-family:Arial,sans-serif;font-size:13px;color:#7b4b00;line-height:1.5;">Your report has been waiting at the health center for ${daysSincePrinting} day(s). Please collect it at your earliest convenience.</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;border-left:4px solid #c05621;background-color:#feebc8;" bgcolor="#feebc8">
    <tr><td style="padding:9px 14px 4px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#c05621;">Collection Location</td></tr>
    <tr><td style="padding:4px 14px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#7b4b00;">${centerName}</td></tr>
    ${centerAddress ? `<tr><td style="padding:3px 14px;font-family:Arial,sans-serif;font-size:13px;color:#4a5568;">${centerAddress}</td></tr>` : ""}
    ${centerPhone ? `<tr><td style="padding:3px 14px;font-family:Arial,sans-serif;font-size:13px;color:#4a5568;">Tel: ${centerPhone}</td></tr>` : ""}
    ${operatingHours ? `<tr><td style="padding:3px 14px;font-family:Arial,sans-serif;font-size:13px;color:#4a5568;">Hours: ${operatingHours}</td></tr>` : ""}
    <tr><td style="padding:0 0 8px 0;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;background-color:#fffbeb;border:1px solid #f6e05e;" bgcolor="#fffbeb">
    <tr><td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;color:#744210;">Please bring a valid government-issued ID when collecting your report.</td></tr>
  </table>
  <p style="margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:14px;color:#4a5568;">You may also view and download your results online by logging into your account.</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr><td align="center" style="padding:8px 0 16px 0;">
      <a href="${loginUrl}" style="display:inline-block;padding:13px 32px;background-color:#c05621;color:#ffffff;text-decoration:none;border-radius:5px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">View Results Online</a>
    </td></tr>
  </table>
  <p style="margin:0;border-top:1px solid #e2e8f0;padding-top:16px;font-family:Arial,sans-serif;font-size:13px;color:#718096;line-height:1.5;">If you have any questions, please contact the health center directly. Do not reply to this email.</p>
</td></tr>
<tr><td align="center" bgcolor="#f7fafc" style="background-color:#f7fafc;padding:16px 24px;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#a0aec0;">MediLab Rural Health System &mdash; <a href="https://medilab.dev" style="color:#718096;text-decoration:none;">medilab.dev</a></p>
  <p style="margin:3px 0 0 0;font-family:Arial,sans-serif;font-size:11px;color:#a0aec0;">&copy; 2026 MediLab. All rights reserved.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

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
  sendHardCopyCollectionReminderEmail,
  isValidEmail,
  isSendGridConfigured,
};
