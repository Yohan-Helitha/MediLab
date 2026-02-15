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

// Mount feature routes
//patient module routes
import memberRoutes from "./modules/patient/routes/memberRoutes.js";
import householdRoutes from "./modules/patient/routes/householdRoutes.js";


//patient module - api routes
app.use("/api/members", memberRoutes);
app.use("/api/households", householdRoutes);

// TODO: mount other feature routes here, e.g.
// import labRoutes from "./modules/lab/lab.routes.js";
// app.use("/api/labs", labRoutes);

export default app;
