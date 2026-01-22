import { Router } from "express";
import { prisma } from "../prisma/client.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();


router.use(requireAuth);


const isValidDate = (v: unknown) => {
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
};


// GET /themes

router.get("/", async (req: AuthRequest, res) => {
  const themes = await prisma.theme.findMany({
    where: { userId: req.userId },
    orderBy: { startAt: "desc" },
  });
  res.json(themes);
});

// POST /themes

router.post("/", async (req: AuthRequest, res) => {
  const { name, startAt, endAt } = req.body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  const start = isValidDate(startAt);
  const end = isValidDate(endAt);

  if (!start || !end) {
    return res.status(400).json({ error: "startAt and endAt must be valid ISO dates" });
  }

  if (end <= start) {
    return res.status(400).json({ error: "endAt must be after startAt" });
  }

  const created = await prisma.theme.create({
    data: {
      userId: req.userId as string,
      name: name.trim(),
      startAt: start,
      endAt: end,
    }
  });

  res.status(201).json(created);
});

// DELETE /themes/:id


router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    // Check ownership
    const existing = await prisma.theme.findUnique({
      where: { id },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.theme.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});


export default router;
