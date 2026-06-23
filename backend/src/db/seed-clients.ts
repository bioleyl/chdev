/**
 * Seed clients — generates French company client entries.
 *
 * Configuration: adjust `count` to change how many clients are seeded.
 */

import { ClientEntity } from '../entities/client.entity.js';
import { AppDataSource } from './connection.js';
import { randomAddress, randomCompany, randomFullName } from './faker.js';

// ── Configuration ─────────────────────────────────────────────────────────────

const count = 200; // number of clients to seed

// ── Seeder ────────────────────────────────────────────────────────────────────

export async function seedClients(): Promise<void> {
  const repo = AppDataSource.getRepository(ClientEntity);
  const existingEmails = new Set((await repo.find({ select: ['email'] })).map((c) => c.email));
  let created = 0;

  for (let i = 0; i < count; i++) {
    const company = randomCompany();
    const address = randomAddress();
    const [street, rest] = address.split(', ');
    const [zip, city] = rest ? rest.split(' ') : [''];

    // Generate a unique email: firstname.lastname@company-domain.com
    const nameParts = randomFullName().split(' ');
    const domain = company
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .slice(0, 10);
    const email = `${nameParts[0].toLowerCase()}.${nameParts[1].toLowerCase()}@${domain}.fr`;

    // Avoid email collisions
    let finalEmail = email;
    let suffix = 1;
    while (existingEmails.has(finalEmail)) {
      finalEmail = `${nameParts[0].toLowerCase()}.${nameParts[1].toLowerCase()}${suffix}@${domain}.fr`;
      suffix++;
    }

    const client = await repo.save(
      repo.create({
        companyName: company,
        email: finalEmail,
        phone: `0${Math.floor(Math.random() * 9) + 1} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
        address: street,
        zipCode: zip ? parseInt(zip, 10) : undefined,
        city: city || undefined,
        country: 'France',
        totalBilled: 0,
      })
    );

    existingEmails.add(finalEmail);
    created++;
    console.log(`  ✓ Created client ${created}/${count}: ${company} (${client.email})`);
  }

  console.log(`  [clients] ${created} created`);
}
