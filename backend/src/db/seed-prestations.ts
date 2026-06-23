/**
 * Seed prestations — generates service/product reference entries.
 *
 * Configuration: adjust `count` to change how many prestations are seeded.
 */

import { PrestationEntity } from '../entities/prestation.entity.js';
import { AppDataSource } from './connection.js';
import { generatePrestation } from './faker.js';

// ── Configuration ─────────────────────────────────────────────────────────────

const count = 50; // number of prestations to seed

// ── Seeder ────────────────────────────────────────────────────────────────────

export async function seedPrestations(): Promise<void> {
  const repo = AppDataSource.getRepository(PrestationEntity);
  const existingLabels = new Set((await repo.find({ select: ['label'] })).map((p) => p.label));
  let created = 0;

  for (let i = 0; i < count; i++) {
    const data = generatePrestation(i);

    // Avoid label collisions by appending a suffix if needed
    let label = data.label;
    let suffix = 1;
    while (existingLabels.has(label)) {
      label = `${data.label} #${suffix}`;
      suffix++;
    }

    await repo.save(
      repo.create({ label, description: data.description, unitPrice: data.unitPrice, unit: data.unit })
    );
    existingLabels.add(label);
    created++;
    console.log(`  ✓ Created prestation ${created}/${count}: ${label}`);
  }

  console.log(`  [prestations] ${created} created`);
}
