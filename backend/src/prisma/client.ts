/**
 * Prisma Client singleton used across the backend.
 *
 * Responsibilities:
 * - Provide a single `PrismaClient` instance for DB access
 * - Avoid multiple connections by exporting one shared client
 */
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
