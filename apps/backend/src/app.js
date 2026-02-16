// Express app configuration
import express from "express";
import cors from "cors";
import morgan from "morgan";
import config from "./config/environment.js";

//booking routes
import bookingRoutes from './modules/booking/booking.routes.js'

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

// TODO: mount feature routes here, e.g.
//register booking routes

app.use('/api/bookings', bookingRoutes);



// import labRoutes from "./modules/lab/lab.routes.js";
// app.use("/api/labs", labRoutes);

export default app;
