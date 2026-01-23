import { Router } from "express";
import { prisma } from "../prisma/client.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

/**
 * Clamp numeric score to integer range 0..10.
 */
const clampScore = (n: unknown) => {
  const v = Number(n);
  if (!Number.isInteger(v) || v < 0 || v > 10) return null;
  return v;
};

// GET /sessions
router.get("/", async (req, res) => {
  const sessions = await prisma.trainingSession.findMany({
    where: { userId: req.userId },
    orderBy: { date: "desc" },
  });
  res.json(sessions);
});

/**
 * List past sessions up to the current time.
 */
router.get("/past", async (req, res) => {
  const now = new Date();
  const sessions = await prisma.trainingSession.findMany({
    where: { userId: req.userId, date: { lte: now } },
    orderBy: { date: "desc" },
  });
  res.json(sessions);
});

// GET /sessions/:id
router.get("/:id", async (req, res) => {
  const session = await prisma.trainingSession.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!session) return res.status(404).json({ error: "Not found" });
  res.json(session);
});

// POST /sessions
router.post("/", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized (missing userId)" });

  const { date, feeling, performance, rating, feedback } = req.body ?? {};

  const feelingV = clampScore(feeling);
  const performanceV = clampScore(performance);
  const ratingV = clampScore(rating);

  if (!date || feelingV === null || performanceV === null || ratingV === null) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const created = await prisma.trainingSession.create({
    data: {
      userId: req.userId,
      date: new Date(date),
      feeling: feelingV,
      performance: performanceV,
      rating: ratingV,
      feedback: feedback ? String(feedback) : null,
    },
  });

  res.status(201).json(created);
});

// PUT /sessions/:id
router.put("/:id", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized (missing userId)" });

  const { date, feeling, performance, rating, feedback } = req.body ?? {};
  const updateData: {
    date?: Date;
    feeling?: number;
    performance?: number;
    rating?: number;
    feedback?: string | null;
  } = {};

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

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "At least one field must be provided" });
  }

  // ownership guard
  const existing = await prisma.trainingSession.findFirst({
    where: { id: req.params.id, userId: req.userId },
    select: { id: true },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.trainingSession.update({
    where: { id: req.params.id },
    data: updateData,
  });

  res.json(updated);
});

// DELETE /sessions/:id
router.delete("/:id", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized (missing userId)" });

  const existing = await prisma.trainingSession.findFirst({
    where: { id: req.params.id, userId: req.userId },
    select: { id: true },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  await prisma.trainingSession.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
