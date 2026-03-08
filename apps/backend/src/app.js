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

//patient module
import authRoutes from "./modules/auth/auth.routes.js";
// Consultation module routes (AI Doctor)
//import consultationRoutes from "./modules/consultation/consultation.routes.js";
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

const app = express();

// Core middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan(config.isDev ? "dev" : "combined"));

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

// Consultation module (AI Doctor) - TODO
//app.use("/api/consultation", consultationRoutes);

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
