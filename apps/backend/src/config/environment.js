// Environment configuration
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve project root .env (one level above /apps)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../../../.env");

dotenv.config({ path: envPath });

const env = process.env;

const config = {
  nodeEnv: env.NODE_ENV || "development",
  isDev: (env.NODE_ENV || "development") === "development",
  port: Number(env.PORT) || 5000,
  databaseUrl: env.DATABASE_URL || "",
  databaseUrlTest: env.DATABASE_URL_TEST || "",
  jwtSecret: env.JWT_SECRET || "",

  // Test Management Component - Third-party APIs
  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID || "",
    authToken: env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: env.TWILIO_PHONE_NUMBER || "",
    // WhatsApp sandbox number — defaults to Twilio sandbox (+14155238886)
    // Set TWILIO_WHATSAPP_NUMBER for a dedicated production WhatsApp Business number
    whatsappNumber: env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
  },
  sendgrid: {
    apiKey: env.SENDGRID_API_KEY || "",
    fromEmail: env.SENDGRID_FROM_EMAIL || "",
    fromName: env.SENDGRID_FROM_NAME || "MediLab",
  },

  // Google Cloud Translation API
  googleTranslate: {
    apiKey: env.GOOGLE_TRANSLATE_API_KEY || "",
  },

  // Application URLs
  appUrl: env.APP_URL || "http://localhost:5000",
  frontendUrl: env.FRONTEND_URL || "http://localhost:3000",
};

export function validateEnv() {
  const missing = [];
  if (!config.databaseUrl) missing.push("DATABASE_URL");
  // Optional: DATABASE_URL_TEST is used automatically during Jest runs.
  // If missing, we will attempt to derive a safe test DB name from DATABASE_URL.
  if (!config.jwtSecret) missing.push("JWT_SECRET");

  // Test Management Component validations (warnings only for development)
  if (config.isDev) {
    const labOpsMissing = [];
    if (!config.twilio.accountSid) labOpsMissing.push("TWILIO_ACCOUNT_SID");
    if (!config.twilio.authToken) labOpsMissing.push("TWILIO_AUTH_TOKEN");
    if (!config.sendgrid.apiKey) labOpsMissing.push("SENDGRID_API_KEY");
    if (!config.googleTranslate.apiKey) labOpsMissing.push("GOOGLE_TRANSLATE_API_KEY");
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