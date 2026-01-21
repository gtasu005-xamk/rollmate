/**
 * Health check router.
 *
 * Exposes `GET /health` returning `{ status: "ok" }` with 200.
 * Useful for uptime probes and deployment readiness checks.
 */
import { Router } from "express";

const router = Router();

/**
 * GET /health
 *
 * Returns a simple success payload to indicate service availability.
 */
router.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default router;