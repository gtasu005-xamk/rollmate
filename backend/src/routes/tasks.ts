/**
 * Tasks router.
 *
 * Endpoints:
 * - GET /tasks → list all tasks ordered by created date desc
 * - POST /tasks → create a new task
 * - GET /tasks/:id → get a single task by ID
 * - PUT /tasks/:id → update a task (title or mark completed)
 * - DELETE /tasks/:id → delete a task
 *
 * Task model: { id, title, completed, createdAt, completedAt? }
 */
import { Router } from "express";
import { prisma } from "../prisma/client.js";

const router = Router();

/**
 * GET /tasks
 * List all tasks ordered by created date (latest first).
 * Response: 200 array of tasks.
 */
router.get("/", async (_req, res) => {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});

/**
 * POST /tasks
 * Create a new task.
 *
 * Expected body: `{ title: string }`
 * Responses:
 * - 201 created task
 * - 400 when title is missing or empty
 */
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

/**
 * GET /tasks/:id
 * Fetch a single task by id.
 * Responses:
 * - 200 task object
 * - 404 when not found
 */
router.get("/:id", async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
  });
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

/**
 * PUT /tasks/:id
 * Update a task (title and/or completed status).
 *
 * Expected body: `{ title?: string, completed?: boolean }`
 * Responses:
 * - 200 updated task
 * - 400 when validation fails
 * - 404 if task does not exist
 */
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

/**
 * DELETE /tasks/:id
 * Delete a task by id.
 * Responses:
 * - 204 on success
 * - 404 when task does not exist
 */
router.delete("/:id", async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;
