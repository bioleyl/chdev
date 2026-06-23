import { loginSchema } from '@chdev/common';
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateMiddleware } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/login', validateMiddleware({ body: loginSchema }, authController.login));
router.get('/me', authMiddleware, authController.me);

export { router as authRouter };
