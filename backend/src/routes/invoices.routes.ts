import { createInvoiceSchema, idParamSchema, updateInvoiceSchema } from '@chdev/common';
import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { paginationMiddleware } from '../middlewares/pagination.middleware.js';
import { validateMiddleware } from '../middlewares/validate.middleware.js';

const router = Router();

// --- Invoice routes ---
// Read routes — all authenticated users
router.get('/', authMiddleware, requireRole('ADMIN', 'EDITOR', 'VIEWER'), invoiceController.getAll);
router.get(
  '/paginated',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  paginationMiddleware({}, invoiceController.getAllPaginated)
);
router.get(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  validateMiddleware({ params: idParamSchema }, invoiceController.getById)
);

// Write routes — EDITOR and ADMIN only
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: createInvoiceSchema }, invoiceController.create)
);
router.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: updateInvoiceSchema, params: idParamSchema }, invoiceController.update)
);
router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ params: idParamSchema }, invoiceController.remove)
);

// Download PDF — EDITOR and ADMIN only
router.get('/:id/download-pdf', validateMiddleware({ params: idParamSchema }, invoiceController.downloadPdf));

export { router as invoicesRouter };
