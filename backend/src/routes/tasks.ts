import { Router } from "express";
import { prisma } from "../prisma/client.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// GET /tasks
router.get("/", async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});

// POST /tasks
router.post("/", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized (missing userId)" });
  }

  const { title } = req.body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const created = await prisma.task.create({
    data: {
      userId: req.userId,
      title: title.trim(),
    },
  });

  res.status(201).json(created);
});

// GET /tasks/:id
router.get("/:id", async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

// PUT /tasks/:id
router.put("/:id", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized (missing userId)" });
  }

  const { title, completed } = req.body ?? {};
  const updateData: { title?: string; completed?: boolean; completedAt?: Date | null } = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title must be a non-empty string" });
    }
    updateData.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "completed must be a boolean" });
    }
    updateData.completed = completed;
    updateData.completedAt = completed ? new Date() : null;
  }

  if (Object.keys(updateData).length === 0) {
    return res
      .status(400)
      .json({ error: "At least one field (title or completed) must be provided" });
  }

  // ownership guard (avoid leaking existence of other users' ids)
  const existing = await prisma.task.findFirst({
    where: { id: req.params.id, userId: req.userId },
    select: { id: true },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.task.update({
    where: { id: req.params.id },
    data: updateData,
  });

  res.json(updated);
});

// DELETE /tasks/:id
router.delete("/:id", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized (missing userId)" });
  }

  const existing = await prisma.task.findFirst({
    where: { id: req.params.id, userId: req.userId },
    select: { id: true },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
