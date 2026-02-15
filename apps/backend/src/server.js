// Server entry point
import app from "./app.js";
import config from "./config/environment.js";
import connectDB from "./config/db.js";

async function start() {
	try {
		await connectDB();
		const server = app.listen(config.port, () => {
			console.log(`[Server] Listening on port ${config.port} (${config.nodeEnv})`);
		});

		const shutdown = (signal) => {
			console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
			server.close(() => {
				console.log("[Server] HTTP server closed");
				process.exit(0);
			});
		};

		process.on("SIGINT", shutdown);
		process.on("SIGTERM", shutdown);

		process.on("unhandledRejection", (reason) => {
			console.error("[Server] Unhandled Rejection:", reason);
		});
		process.on("uncaughtException", (err) => {
			console.error("[Server] Uncaught Exception:", err);
		});
	} catch (err) {
		console.error("[Server] Startup error:", err);
		process.exit(1);
	}
}

start();
