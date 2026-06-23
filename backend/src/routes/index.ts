import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { clientsRouter } from './clients.routes.js';
import { invoicesRouter } from './invoices.routes.js';
import { prestationsRouter } from './prestations.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/clients', clientsRouter);
router.use('/prestations', prestationsRouter);
router.use('/invoices', invoicesRouter);

export const routes = router;
