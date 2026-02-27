// Database configuration
import mongoose from "mongoose";
import config, { validateEnv } from "./environment.js";

// Platform-specific DNS fix for Windows
// MongoDB Atlas SRV record resolution fails on some Windows networks due to Node.js DNS resolver issues
// This fix only applies on Windows and doesn't affect Linux/Mac team members
if (process.platform === "win32") {
  try {
    const { setServers } = await import("node:dns/promises");
    setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google DNS
    console.log(
      "[DB] Windows DNS fix applied for MongoDB Atlas SRV resolution",
    );
  } catch (error) {
    console.warn("[DB] Could not apply Windows DNS fix:", error.message);
  }
}

mongoose.set("strictQuery", true);

const connectionOptions = {
  // Mongoose 8+ defaults are good; tune selection timeouts if needed
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
};

let hasBoundEvents = false;

function bindConnectionEvents() {
  if (hasBoundEvents) return;
  hasBoundEvents = true;
  const conn = mongoose.connection;
  conn.on("connected", () => console.log("[DB] MongoDB connected"));
  conn.on("error", (err) => console.error("[DB] MongoDB error:", err.message));
  conn.on("disconnected", () => console.warn("[DB] MongoDB disconnected"));
}

export async function connectDB() {
  validateEnv();
  bindConnectionEvents();

  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add it to your .env file.");
  }

  // Avoid reconnecting if already connected or connecting
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoose.connection.readyState === 2) return mongoose.connection;

  await mongoose.connect(config.databaseUrl, connectionOptions);
  return mongoose.connection;
}

export default connectDB;
