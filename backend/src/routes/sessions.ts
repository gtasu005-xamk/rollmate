/**
 * Training sessions router.
 *
 * Endpoints:
 * - GET /sessions → list sessions ordered by date desc
 * - GET /sessions/past → list sessions up to `now`
 * - GET /sessions/:id → get one session by id
 * - POST /sessions → create a new session
 * - PUT /sessions/:id → update an existing session
 * - DELETE /sessions/:id → remove a session
 *
 * Authentication:
 * - All endpoints require a valid bearer token via `requireAuth`
 */
import { Router } from "express";
import { prisma } from "../prisma/client.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// All session routes require authentication
router.use(requireAuth);

/**
 * Clamp numeric score to integer range 0..10.
 * Accepts unknown inputs, converts to number, and validates boundaries.
 * Returns `null` if invalid; otherwise the clamped integer.
 */
const clampScore = (n: unknown) => {
  const v = Number(n);
  if (!Number.isInteger(v) || v < 0 || v > 10) return null;
  return v;
};

// GET /sessions
/**
 * List all training sessions ordered by latest date first.
 * Response: 200 array of sessions.
 */
router.get("/", async (_req: AuthRequest, res) => {
  const sessions = await prisma.trainingSession.findMany({
    orderBy: { date: "desc" },
  });
  res.json(sessions);
});

/**
 * List past sessions up to the current time.
 * Response: 200 array of sessions.
 */
router.get("/past", async (_req, res) => {
  const now = new Date();
  const sessions = await prisma.trainingSession.findMany({
    where: { date: { lte: now } },
    orderBy: { date: "desc" },
  });
  res.json(sessions);
});

// GET /sessions/:id
/**
 * Fetch a single session by id.
 * Responses:
 * - 200 session object
 * - 404 when not found
 */
router.get("/:id", async (req, res) => {
  const session = await prisma.trainingSession.findUnique({
    where: { id: req.params.id },
  });
  if (!session) return res.status(404).json({ error: "Not found" });
  res.json(session);
});

// POST /sessions
/**
 * Create a new training session.
 *
 * Expected body: `{ date: ISO string, feeling: 0..10, performance: 0..10, rating: 0..10, feedback?: string }`
 * Responses:
 * - 201 created session
 * - 400 when validation fails
 */
router.post("/", async (req, res) => {
const { date, feeling, performance, rating, feedback } = req.body ?? {};

  const feelingV = clampScore(feeling);
  const performanceV = clampScore(performance);
  const ratingV = clampScore(rating);

 if (!date || feelingV === null || performanceV === null || ratingV === null) {
  return res.status(400).json({ error: "Invalid payload" });
}

  const created = await prisma.trainingSession.create({
    data: {
      date: new Date(date),
      feeling: feelingV,
      performance: performanceV,
      rating: ratingV,
      feedback: feedback ? String(feedback) : null,
    } 
  });

  res.status(201).json(created);
});

// PUT /sessions/:id
/**
 * Update fields on an existing session.
 *
 * Supports partial update of: `date`, `feeling`, `performance`, `rating`, `feedback`.
 * Responses:
 * - 200 updated session
 * - 400 when any numeric score is invalid
 * - 404 if the session does not exist
 */
router.put("/:id", async (req, res) => {
  const { date, feeling, performance, rating, feedback } = req.body ?? {};

  const updateData: any = {};

  if (date !== undefined) updateData.date = new Date(date);
  if (feeling !== undefined) {
    const v = clampScore(feeling);
    if (v === null) return res.status(400).json({ error: "feeling must be 0–10" });
    updateData.feeling = v;
  }
  if (performance !== undefined) {
    const v = clampScore(performance);
    if (v === null) return res.status(400).json({ error: "performance must be 0–10" });
    updateData.performance = v;
  }
  if (rating !== undefined) {
    const v = clampScore(rating);
    if (v === null) return res.status(400).json({ error: "rating must be 0–10" });
    updateData.rating = v;
  }
  if (feedback !== undefined) updateData.feedback = feedback ? String(feedback) : null;

  try {
    const updated = await prisma.trainingSession.update({
      where: { id: req.params.id },
      data: updateData as any,
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// DELETE /sessions/:id
/**
 * Delete a session by id.
 * Responses:
 * - 204 on success
 * - 404 when the session is not found
 */
router.delete("/:id", async (req, res) => {
  try {
    await prisma.trainingSession.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;
