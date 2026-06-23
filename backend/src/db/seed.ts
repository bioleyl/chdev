import 'dotenv/config';
import 'reflect-metadata';
import { AppDataSource } from './connection.js';
import { seedClients } from './seed-clients.js';
import { seedInvoices } from './seed-invoices.js';
import { seedPrestations } from './seed-prestations.js';
import { seedUsers } from './seed-users.js';

async function seedDatabase() {
  await AppDataSource.initialize();
  console.log('Seeding database...\n');

  console.log('─'.repeat(50));
  console.log('Step 1: Users (one per role)');
  console.log('─'.repeat(50));
  await seedUsers();

  console.log('─'.repeat(50));
  console.log('Step 2: Prestations');
  console.log('─'.repeat(50));
  await seedPrestations();

  console.log('─'.repeat(50));
  console.log('Step 3: Clients');
  console.log('─'.repeat(50));
  await seedClients();

  console.log('─'.repeat(50));
  console.log('Step 4: Invoices (one per client)');
  console.log('─'.repeat(50));
  await seedInvoices();

  console.log('─'.repeat(50));
  console.log('Seeding completed successfully.');
  console.log('─'.repeat(50));
  await AppDataSource.destroy();
}

seedDatabase().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
