// Environment configuration
import dotenv from "dotenv";

dotenv.config();

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
