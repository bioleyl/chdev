import { createClientSchema, idParamSchema, updateClientSchema } from '@chdev/common';
import { Router } from 'express';
import { clientController } from '../controllers/client.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { paginationMiddleware } from '../middlewares/pagination.middleware.js';
import { validateMiddleware } from '../middlewares/validate.middleware.js';

const router = Router();

// Read routes — all authenticated users
router.get('/', authMiddleware, requireRole('ADMIN', 'EDITOR', 'VIEWER'), clientController.getAll);
router.get(
  '/paginated',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  paginationMiddleware({}, clientController.getAllPaginated)
);
router.get(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  validateMiddleware({ params: idParamSchema }, clientController.getById)
);

// Write routes — EDITOR and ADMIN only
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: createClientSchema }, clientController.create)
);
router.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: updateClientSchema, params: idParamSchema }, clientController.update)
);
router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ params: idParamSchema }, clientController.remove)
);

router.get(
  '/:id/invoices',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  validateMiddleware({ params: idParamSchema }, clientController.getInvoicesByClientId)
);

export { router as clientsRouter };
