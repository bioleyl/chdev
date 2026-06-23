import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { routes } from './routes/index.js';
import type { Express, Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');

  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    // SPA fallback: serve index.html for any non-API route
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(frontendDist, 'index.html'));
    });
  } else {
    console.warn('Frontend dist folder not found at:', frontendDist);
  }
}

export { app };
