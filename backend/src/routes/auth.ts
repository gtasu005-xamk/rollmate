
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { prisma } from "../prisma/client.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const ACCESS_TOKEN_EXPIRY = "7d"; // Longer expiry since no refresh

interface TokenPayload {
  userId: string;
}

/**
 * Create a signed JWT access token for a given user id.
 * @param userId Unique user identifier from DB
 * @returns Signed JWT string that expires based on `ACCESS_TOKEN_EXPIRY`
 */
function generateAccessToken(userId: string): string {
  return jwt.sign({ userId } as TokenPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Email and password are required" },
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: { code: "USER_EXISTS", message: "User with this email already exists" },
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    // Generate access token
    const accessToken = generateAccessToken(user.id);

    return res.status(201).json({
      accessToken,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Registration failed" },
    });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Email and password are required" },
      });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
      });
    }

    // Check password
    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
      });
    }

    // Generate access token
    const accessToken = generateAccessToken(user.id);

    return res.json({
      accessToken,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Login failed" },
    });
  }
});

export default router;
