/**
 * Express application setup for the Rollmate backend.
 *
 * Responsibilities:
 * - Initialize Express app and read `PORT` from environment
 * - Register security, CORS, JSON body parsing, and request logging middleware
 * - Mount feature routers: health, auth, sessions, themes
 * - Start the HTTP server and export the app instance for external use
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import healthRouter from "./routes/health.js";
import sessionsRouter from "./routes/sessions.js";
import themesRouter from "./routes/themes.js";
import authRouter from "./routes/auth.js";
import tasksRouter from "./routes/tasks.js";


const app = express();

/**
 * Global middleware stack:
 * - `helmet()`: sets secure HTTP headers
 * - `cors(...)`: enables CORS; in dev allows all origins, in prod restricts
 * - `express.json()`: parses JSON request bodies into `req.body`
 * - `morgan("combined")`: request logging in Apache combined format
 */

app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
      ? ["https://yourdomain.com"]
      : true, // Allow all origins in development
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
app.use(express.json());
app.use(morgan("combined"));

/**
 * Route mounts:
 * - `/health`: service health checks
 * - `/auth`: registration and login, returns JWT access tokens
 * - `/sessions`: training sessions CRUD
 * - `/themes`: training themes (time-bounded focus areas) CRUD
 * - `/tasks`: task management CRUD
 */
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/sessions", sessionsRouter);
app.use("/themes", themesRouter);
app.use("/tasks", tasksRouter);

/**
 * Export the configured app without starting the server.
 * The server.ts file is responsible for calling app.listen().
 */
export default app;
