// Express app configuration
import express from "express";
import cors from "cors";
import morgan from "morgan";
import config from "./config/environment.js";

const app = express();

// Core middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan(config.isDev ? "dev" : "combined"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: config.nodeEnv });
});

// Feature routes
// TODO: mount other feature routes as needed
// import labRoutes from "./modules/lab/lab.routes.js";
// app.use("/api/labs", labRoutes);

// Test Management Component Routes
// Note: TestType CRUD endpoints (/api/tests) are managed by Lab Operations Component
import resultRoutes from "./modules/result/result.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";

app.use("/api/results", resultRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling (must be after all routes)
import { errorHandler, notFoundHandler } from "./core/error-handler.js";
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Global error handler

export default app;
