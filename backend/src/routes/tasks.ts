
import { Router } from "express";
import { prisma } from "../prisma/client.js";

const router = Router();

//GET /tasks

router.get("/", async (_req, res) => {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});


//POST /tasks

router.post("/", async (req, res) => {
  const { title } = req.body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const created = await prisma.task.create({
    data: { title: title.trim() },
  });

  res.status(201).json(created);
});


//GET /tasks/:id

router.get("/:id", async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
  });
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

//PUT /tasks/:id

router.put("/:id", async (req, res) => {
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
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});


//DELETE /tasks/:id

router.delete("/:id", async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;
