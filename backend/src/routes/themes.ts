/**
 * Themes router.
 *
 * Endpoints:
 * - GET /themes → list themes ordered by `startAt` desc
 * - POST /themes → create a new theme between `startAt` and `endAt`
 * - DELETE /themes/:id → remove a theme
 *
 * Authentication:
 * - All endpoints require a valid bearer token via `requireAuth`
 */
import { Router } from "express";
import { prisma } from "../prisma/client.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// All theme routes require authentication
router.use(requireAuth);

/**
 * Parse and validate a date-like input.
 * Returns `Date` instance or `null` if invalid.
 */
const isValidDate = (v: unknown) => {
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
};


// GET /themes
/**
 * List all themes ordered by `startAt` (latest first).
 * Response: 200 array of themes.
 */
router.get("/", async (_req: AuthRequest, res) => {
  const themes = await prisma.theme.findMany({
    orderBy: { startAt: "desc" },
  });
  res.json(themes);
});

// POST /themes
/**
 * Create a new theme.
 *
 * Expected body: `{ name: string, startAt: ISO date, endAt: ISO date }`
 * Constraints: `endAt` must be after `startAt`.
 * Responses:
 * - 201 created theme
 * - 400 when validation fails
 */
router.post("/", async (req, res) => {
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
      name: name.trim(),
      startAt: start,
      endAt: end,
    } // jos TS/Prisma-tyypit vielä temppuilee
  });

  res.status(201).json(created);
});

// DELETE /themes/:id
/**
 * Delete a theme by id.
 * Responses:
 * - 204 on success
 * - 404 when the theme does not exist
 */
router.delete("/:id", async (req, res) => {
  try {
    await prisma.theme.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});


export default router;
