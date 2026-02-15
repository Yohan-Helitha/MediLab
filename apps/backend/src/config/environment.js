// Environment configuration
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for .env file in the root directory with absolute path to avoid confusion
const envPath = path.resolve(__dirname, "../../../../.env");
console.log(`[Debug] Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

const env = process.env;

const config = {
	nodeEnv: env.NODE_ENV || "development",
	isDev: (env.NODE_ENV || "development") === "development",
	port: Number(env.PORT) || 5000,
	databaseUrl: env.DATABASE_URL || "",
	jwtSecret: env.JWT_SECRET || "",
};

export function validateEnv() {
	const missing = [];
	if (!config.databaseUrl) missing.push("DATABASE_URL");
	if (!config.jwtSecret) missing.push("JWT_SECRET");
	if (missing.length) {
		// Log a helpful message without crashing immediately
		console.warn(
			`Missing environment variables: ${missing.join(", ")}. Check your .env file.`
		);
	}
}

export default config;
