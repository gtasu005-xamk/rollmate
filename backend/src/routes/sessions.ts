
import { Router } from "express";
import { prisma } from "../prisma/client.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

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
router.get("/", async (req: AuthRequest, res) => {
  const sessions = await prisma.trainingSession.findMany({
    where: { userId: req.userId },
    orderBy: { date: "desc" },
  });
  res.json(sessions);
});

/**
 * List past sessions up to the current time.
 */
router.get("/past", async (req: AuthRequest, res) => {
  const now = new Date();
  const sessions = await prisma.trainingSession.findMany({
    where: { 
      userId: req.userId,
      date: { lte: now } 
    },
    orderBy: { date: "desc" },
  });
  res.json(sessions);
});

// GET /sessions/:id

router.get("/:id", async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const session = await prisma.trainingSession.findUnique({
    where: { id },
  });
  if (!session) return res.status(404).json({ error: "Not found" });
  if (session.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });
  res.json(session);
});

// POST /sessions

router.post("/", async (req: AuthRequest, res) => {
  const { date, feeling, performance, rating, feedback } = req.body ?? {};

  const feelingV = clampScore(feeling);
  const performanceV = clampScore(performance);
  const ratingV = clampScore(rating);

  if (!date || feelingV === null || performanceV === null || ratingV === null) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const created = await prisma.trainingSession.create({
    data: {
      userId: req.userId as string,
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

router.put("/:id", async (req: AuthRequest, res) => {
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
    const id = req.params.id as string;
    // Check ownership
    const existing = await prisma.trainingSession.findUnique({
      where: { id },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.trainingSession.update({
      where: { id },
      data: updateData as any,
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// DELETE /sessions/:id

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    // Check ownership
    const existing = await prisma.trainingSession.findUnique({
      where: { id },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.trainingSession.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;
