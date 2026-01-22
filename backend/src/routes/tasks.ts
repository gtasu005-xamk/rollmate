
import { Router } from "express";
import { prisma } from "../prisma/client.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

//GET /tasks

router.get("/", async (req: AuthRequest, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});


//POST /tasks

router.post("/", async (req: AuthRequest, res) => {
  const { title } = req.body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const created = await prisma.task.create({
    data: { 
      userId: req.userId as string,
      title: title.trim() 
    },
  });

  res.status(201).json(created);
});


//GET /tasks/:id

router.get("/:id", async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const task = await prisma.task.findUnique({
    where: { id },
  });
  if (!task) return res.status(404).json({ error: "Not found" });
  if (task.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });
  res.json(task);
});

//PUT /tasks/:id

router.put("/:id", async (req: AuthRequest, res) => {
  const { title, completed } = req.body ?? {};

  const updateData: any = {};

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
    return res.status(400).json({ error: "At least one field (title or completed) must be provided" });
  }

  try {
    const id = req.params.id as string;
    // Check ownership
    const existing = await prisma.task.findUnique({
      where: { id },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});


//DELETE /tasks/:id

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    // Check ownership
    const existing = await prisma.task.findUnique({
      where: { id },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;