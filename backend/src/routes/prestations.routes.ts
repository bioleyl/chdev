import { createPrestationSchema, idParamSchema, updatePrestationSchema } from '@chdev/common';
import { Router } from 'express';
import { prestationController } from '../controllers/prestation.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { paginationMiddleware } from '../middlewares/pagination.middleware.js';
import { validateMiddleware } from '../middlewares/validate.middleware.js';

const router = Router();

// Read routes — all authenticated users
router.get('/', authMiddleware, requireRole('ADMIN', 'EDITOR', 'VIEWER'), prestationController.getAll);
router.get(
  '/paginated',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  paginationMiddleware({}, prestationController.getAllPaginated)
);
router.get(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  validateMiddleware({ params: idParamSchema }, prestationController.getById)
);

// Write routes — EDITOR and ADMIN only
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: createPrestationSchema }, prestationController.create)
);
router.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: updatePrestationSchema, params: idParamSchema }, prestationController.update)
);
router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ params: idParamSchema }, prestationController.remove)
);

export { router as prestationsRouter };
