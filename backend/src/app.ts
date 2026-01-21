
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


app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/sessions", sessionsRouter);
app.use("/themes", themesRouter);
app.use("/tasks", tasksRouter);


export default app;
