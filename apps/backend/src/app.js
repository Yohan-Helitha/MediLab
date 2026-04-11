// Express app configuration
import express from "express";
import cors from "cors";
import morgan from "morgan";
import config from "./config/environment.js";
import labRoutes from "./modules/lab/lab.routes.js";
import testRoutes from "./modules/test/test.routes.js";
import labTestRoutes from "./modules/lab/labTest.routes.js";
import testInstructionRoutes from "./modules/lab/testInstruction.routes.js";

// booking routes
import bookingRoutes from "./modules/booking/booking.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import equipmentRoutes from "./modules/inventory/equipment.routes.js";
import financeRoutes from "./modules/finance/finance.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

// Payment gateway routes (PayHere)
import payHereRoutes from "./modules/payment/payhere.routes.js";

//patient module
import authRoutes from "./modules/auth/auth.routes.js";
// Consultation module routes (AI Doctor)
import consultationRoutes from "./modules/consultation/routes/consultationRoutes.js";
import geminiRoutes from "./modules/consultation/routes/geminiRoutes.js";
import translationRoutes from "./modules/translation/translation.routes.js";
//patient module routes
import memberRoutes from "./modules/patient/routes/memberRoutes.js";
import householdRoutes from "./modules/patient/routes/householdRoutes.js";
import healthDetailsRoutes from "./modules/patient/routes/healthDetailsRoutes.js";
import allergyRoutes from "./modules/patient/routes/allergyRoutes.js";
import chronicDiseaseRoutes from "./modules/patient/routes/chronicDiseaseRoutes.js";
import medicationRoutes from "./modules/patient/routes/medicationRoutes.js";
import pastMedicalHistoryRoutes from "./modules/patient/routes/pastMedicalHistoryRoutes.js";
import emergencyContactRoutes from "./modules/patient/routes/emergencyContactRoutes.js";
import familyMemberRoutes from "./modules/patient/routes/familyMemberRoutes.js";
import familyRelationshipRoutes from "./modules/patient/routes/familyRelationshipRoutes.js";
import visitRoutes from "./modules/patient/routes/visitRoutes.js";
import referralRoutes from "./modules/patient/routes/referralRoutes.js";

// Test Management Component routes
import resultRoutes from "./modules/result/result.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Core middleware
const parseCsv = (value) =>
  String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const normalizeOrigin = (value) => {
  const v = String(value || '').trim();
  return v.replace(/\/+$/g, '');
};

const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',

    // Your custom production domain
    'https://medilab.dev',

    // Optional env-driven origin(s)
    process.env.FRONTEND_URL,
    process.env.WEB_URL,
    ...parseCsv(process.env.CORS_ORIGINS),
  ]
    .filter(Boolean)
    .map(normalizeOrigin),
);

const allowedOriginPatterns = [
  // Vercel preview + production domains
  /^https:\/\/.*\.vercel\.app$/i,
];

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (curl/Postman) with no Origin
    if (!origin) return callback(null, true);

    const normalized = normalizeOrigin(origin);
    const isAllowed =
      allowedOrigins.has(normalized) ||
      allowedOriginPatterns.some((re) => re.test(normalized));

    return callback(null, isAllowed);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isDev ? "dev" : "combined"));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Feature routes
app.use("/api/labs", labRoutes);
app.use("/api/test-types", testRoutes);
app.use("/api/lab-tests", labTestRoutes);
app.use("/api/test-instructions", testInstructionRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: config.nodeEnv });
});

// Auth module routes
app.use("/api/auth", authRoutes);

// Consultation module (AI Doctor)
app.use("/api/consultation", consultationRoutes);
app.use("/api/ai", geminiRoutes);
app.use("/api/translation", translationRoutes);

// Translation module (Google Cloud Translation API)
app.use("/api/translation", translationRoutes);

// Patient module - api routes
app.use("/api/members", memberRoutes);
app.use("/api/households", householdRoutes);
app.use("/api/health-details", healthDetailsRoutes);
app.use("/api/allergies", allergyRoutes);
app.use("/api/chronic-diseases", chronicDiseaseRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/past-medical-history", pastMedicalHistoryRoutes);
app.use("/api/emergency-contacts", emergencyContactRoutes);
app.use("/api/family-members", familyMemberRoutes);
app.use("/api/family-relationships", familyRelationshipRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/referrals", referralRoutes);

// Booking and Inventory module routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/admin", adminRoutes);

// PayHere (checkout + notify)
app.use("/api/payments/payhere", payHereRoutes);

// Test Management Component Routes
// Note: TestType CRUD endpoints (/api/test-types) are managed by Lab Operations Component (Arani)
// This component manages: Test Results (/api/results) and Notifications (/api/notifications)
app.use("/api/results", resultRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling (must be after all routes)
import { errorHandler, notFoundHandler } from "./core/error-handler.js";
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Global error handler

export default app;
