import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import type { LoginInput } from '@chdev/common';
import type { Response } from 'express';
import type { TypedRequest } from '../middlewares/validate.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';

function generateToken(payload: { id: number; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY as jwt.SignOptions['expiresIn'] });
}

class AuthController {
  async login(req: TypedRequest<LoginInput>, res: Response): Promise<void> {
    const { email, password } = req.body;

    const repository = UserRepository.create();
    const user = await repository.findByEmail(email);

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  }

  async me(req: TypedRequest<unknown, unknown>, res: Response): Promise<void> {
    const user = (req as import('../middlewares/auth.middleware.js').AuthRequest).user;
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}

export const authController = new AuthController();
