import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export interface AuthRequest extends Request {
  userId?: string;
}

type TokenPayload = JwtPayload & {
  userId?: string;
  id?: string;
};

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: { code: "NO_TOKEN", message: "Authorization token required" },
      });
      return;
    }

    const token = authHeader.slice(7);

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Common patterns:
    // - sub (JWT standard subject)
    // - userId (custom)
    // - id (custom)
    const uid = decoded.sub || decoded.userId || decoded.id;


    // FAIL-FAST: do not allow any protected handler to run without a valid user id
    if (!uid || typeof uid !== "string" || !uid.trim()) {
      res.status(401).json({
        error: { code: "INVALID_TOKEN", message: "Invalid token (missing user id)" },
      });
      return;
    }

    req.userId = uid.trim();

    // FAIL-FAST (post-condition safety net)
    if (!req.userId) {
      res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Unauthorized (missing userId)" },
      });
      return;
    }

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
