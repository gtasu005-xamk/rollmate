/**
 * Backend entrypoint that boots the HTTP server.
 *
 * Responsibilities:
 * - Import the configured Express `app`
 * - Resolve port from `process.env.PORT` (default 3000)
 * - Listen for incoming connections and log readiness
 */
import app from "./app.js";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

/**
 * Begin accepting HTTP requests on the chosen port.
 */
app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on port ${port}`);
});
