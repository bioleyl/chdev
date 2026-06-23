import 'dotenv/config';
import 'reflect-metadata';
import { AppDataSource } from './connection.js';

async function runMigrations() {
  await AppDataSource.initialize();
  console.log('Running migrations...');
  await AppDataSource.runMigrations();
  console.log('Migrations completed successfully.');
  await AppDataSource.destroy();
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
