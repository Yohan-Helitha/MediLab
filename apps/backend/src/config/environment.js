// Environment configuration
import dotenv from "dotenv";

dotenv.config();

const env = process.env;

const config = {
  nodeEnv: env.NODE_ENV || "development",
  isDev: (env.NODE_ENV || "development") === "development",
  port: Number(env.PORT) || 5000,
  databaseUrl: env.DATABASE_URL || "",
  jwtSecret: env.JWT_SECRET || "",

  // Test Management Component - Third-party APIs
  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID || "",
    authToken: env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: env.TWILIO_PHONE_NUMBER || "",
  },
  sendgrid: {
    apiKey: env.SENDGRID_API_KEY || "",
    fromEmail: env.SENDGRID_FROM_EMAIL || "",
    fromName: env.SENDGRID_FROM_NAME || "MediLab",
  },

  // Application URLs
  appUrl: env.APP_URL || "http://localhost:5000",
  frontendUrl: env.FRONTEND_URL || "http://localhost:3000",
};

export function validateEnv() {
  const missing = [];
  if (!config.databaseUrl) missing.push("DATABASE_URL");
  if (!config.jwtSecret) missing.push("JWT_SECRET");

  // Test Management Component validations (warnings only for development)
  if (config.isDev) {
    const labOpsMissing = [];
    if (!config.twilio.accountSid) labOpsMissing.push("TWILIO_ACCOUNT_SID");
    if (!config.twilio.authToken) labOpsMissing.push("TWILIO_AUTH_TOKEN");
    if (!config.sendgrid.apiKey) labOpsMissing.push("SENDGRID_API_KEY");
    if (labOpsMissing.length) {
      console.warn(
        `[Test Management] Missing third-party API credentials: ${labOpsMissing.join(", ")}. Notification features will not work.`,
      );
    }
  }

  if (missing.length) {
    // Log a helpful message without crashing immediately
    console.warn(
      `Missing environment variables: ${missing.join(", ")}. Check your .env file.`,
    );
  }
}

export default config;
