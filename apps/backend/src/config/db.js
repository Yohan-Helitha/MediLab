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

const isJestRun = () =>
  typeof process.env.JEST_WORKER_ID !== "undefined" ||
  (process.env.NODE_ENV || "").toLowerCase() === "test";

const deriveTestDatabaseUrl = (baseUrl) => {
  if (!baseUrl) return "";
  try {
    const url = new URL(baseUrl);
    const pathParts = (url.pathname || "/").split("/").filter(Boolean);

    // mongodb+srv URLs typically include the db name in the pathname: /mediLab
    const dbName = pathParts[0] || "test";
    const nextDbName = dbName.endsWith("_test") ? dbName : `${dbName}_test`;
    url.pathname = `/${nextDbName}`;
    return url.toString();
  } catch {
    // If parsing fails, do not risk connecting to the wrong DB.
    return "";
  }
};

const getDbNameForLog = (dbUrl) => {
  try {
    const url = new URL(dbUrl);
    const pathParts = (url.pathname || "/").split("/").filter(Boolean);
    return pathParts[0] || "(none)";
  } catch {
    return "(unknown)";
  }
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

  const preferTestDb = isJestRun();
  const testUrl = config.databaseUrlTest || deriveTestDatabaseUrl(config.databaseUrl);
  const selectedUrl = preferTestDb ? testUrl : config.databaseUrl;

  if (!selectedUrl) {
    if (preferTestDb) {
      throw new Error(
        "Test database URL is not set. Set DATABASE_URL_TEST (recommended) or ensure DATABASE_URL contains a database name so a safe _test DB can be derived.",
      );
    }
    throw new Error("DATABASE_URL is not set. Add it to your .env file.");
  }

  const mode = preferTestDb ? "test" : "app";
  console.log(`[DB] Using database: ${getDbNameForLog(selectedUrl)} (${mode})`);

  // Avoid reconnecting if already connected or connecting
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoose.connection.readyState === 2) return mongoose.connection;

  await mongoose.connect(selectedUrl, connectionOptions);
  return mongoose.connection;
}

export default connectDB;
