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


const corsOrigin =
  process.env.NODE_ENV === "production"
    ? (process.env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean)
    : true;

app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // pidä false jos käytät Bearer-token headeria 
  })
);

app.use(express.json());
app.use(morgan("combined"));

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/sessions", sessionsRouter);
app.use("/themes", themesRouter);
app.use("/tasks", tasksRouter);

export default app;
