// Express app configuration
import express from "express";
import cors from "cors";
import morgan from "morgan";
import config from "./config/environment.js";
import labRoutes from "./modules/lab/lab.routes.js";
import testRoutes from "./modules/test/test.routes.js";
import labTestRoutes from "./modules/lab/labTest.routes.js";
import testInstructionRoutes from "./modules/lab/testInstruction.routes.js";

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

export default app;
