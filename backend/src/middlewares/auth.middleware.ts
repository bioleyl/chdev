import jwt from 'jsonwebtoken';
import type { JwtPayload, Role } from '@chdev/common';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface AuthRequest extends Omit<Request, 'user'> {
  user: JwtPayload;
}

/**
 * Middleware that verifies a JWT Bearer token and attaches the decoded payload to req.user.
 * Returns 401 if the token is missing or invalid.
 */
export const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as AuthRequest).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware factory that restricts access to users with one of the allowed roles.
 * Must be used after authMiddleware.
 *
 * @param roles - The roles that are allowed to access the route.
 * @returns Express middleware that checks req.user.role against the allowed roles.
 *
 * @example
 * ```ts
 * router.get('/', authMiddleware, requireRole('ADMIN', 'EDITOR'), controller.getAll);
 * ```
 */
export function requireRole(...roles: Array<Role>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) {
      return _res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(user.role)) {
      return _res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
