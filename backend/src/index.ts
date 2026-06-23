import 'dotenv/config';
import 'reflect-metadata';
import { app } from './app.js';
import { initializeDatabase } from './db/connection.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function bootstrap() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(console.error);
