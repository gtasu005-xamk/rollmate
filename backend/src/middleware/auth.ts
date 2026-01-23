import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Require bearer JWT authentication for protected routes.
 *
 * Behavior:
 * - Reads `Authorization: Bearer <token>` header
 * - Verifies token signature and expiry with `JWT_SECRET`
 * - Extracts `userId` from payload and attaches it to `req.userId`
 * - Responds with 401 and structured error codes for missing/expired/invalid token
 *
 * @param req Express request, augmented as `AuthRequest` to hold `userId`
 * @param res Express response used for 401 error replies
 * @param next Calls next middleware/handler when authentication succeeds
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: { code: "NO_TOKEN", message: "Authorization token required" },
      });
      return;
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: { code: "TOKEN_EXPIRED", message: "Token has expired" },
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: { code: "INVALID_TOKEN", message: "Invalid token" },
      });
    } else {
      res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      });
    }
  }
}
