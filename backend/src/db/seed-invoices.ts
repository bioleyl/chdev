/**
 * Seed invoices — generates invoices for every seeded client.
 *
 * Configuration:
 *   - `invoicesPerClient.min` / `invoicesPerClient.max` → range of invoices per client
 *   - `linesPerInvoice.min` / `linesPerInvoice.max`   → range of line items per invoice
 */

import { ClientEntity } from '../entities/client.entity.js';
import { InvoiceEntity } from '../entities/invoice.entity.js';
import { InvoiceLineEntity } from '../entities/invoice-line.entity.js';
import { PrestationEntity } from '../entities/prestation.entity.js';
import { AppDataSource } from './connection.js';
import { generateRawInvoice, randomInt, randomItem } from './faker.js';

// ── Configuration ─────────────────────────────────────────────────────────────

const invoicesPerClient = { min: 5, max: 15 }; // invoices per client
const linesPerInvoice = { min: 5, max: 15 }; // line items per invoice

// ── Seeder ────────────────────────────────────────────────────────────────────

export async function seedInvoices(): Promise<void> {
  const invoiceRepo = AppDataSource.getRepository(InvoiceEntity);
  const invoiceLineRepo = AppDataSource.getRepository(InvoiceLineEntity);
  const clientRepo = AppDataSource.getRepository(ClientEntity);
  const prestationRepo = AppDataSource.getRepository(PrestationEntity);

  // Fetch data once
  const [clients, prestations] = await Promise.all([clientRepo.find(), prestationRepo.find()]);

  if (clients.length === 0) {
    console.log('  ⚠ No clients found. Seed clients first.');
    return;
  }

  if (prestations.length === 0) {
    console.log('  ⚠ No prestations found. Seed prestations first.');
    return;
  }

  const prestationPriceList = prestations.map((p) => ({
    unitPrice: p.unitPrice,
    unit: p.unit,
  }));

  // Track existing invoice numbers to avoid collisions
  const existingNumbers = new Set((await invoiceRepo.find({ select: ['number'] })).map((i) => i.number));

  let totalCreated = 0;
  let totalLines = 0;

  // Seed invoices for each client
  for (const client of clients) {
    const numInvoices = randomInt(invoicesPerClient.min, invoicesPerClient.max);

    for (let seq = 0; seq < numInvoices; seq++) {
      const year = 2024 + Math.floor(Math.random() * 3); // 2024, 2025, or 2026
      // Use '-' separator (not '/') to be Windows-filename-safe
      const number = `INV-${year}-${String(seq).padStart(4, '0')}`;

      if (existingNumbers.has(number)) {
        continue;
      }

      // Generate raw invoice data (random number of lines)
      const raw = generateRawInvoice(
        year,
        seq,
        prestationPriceList,
        randomInt(linesPerInvoice.min, linesPerInvoice.max)
      );

      // Create invoice
      const invoice = invoiceRepo.create({
        ...raw.invoice,
        clientId: client.id,
      });

      await invoiceRepo.save(invoice);
      existingNumbers.add(number);
      totalCreated++;

      // Create invoice lines
      let invoiceTotal = 0;

      for (const line of raw.lines) {
        const chosenPrestation = randomItem(prestations);
        const lineAmount = chosenPrestation.unitPrice * line.quantity;
        invoiceTotal += lineAmount;

        await invoiceLineRepo.save(
          invoiceLineRepo.create({
            invoice,
            invoiceId: invoice.id,
            prestation: chosenPrestation,
            prestationId: chosenPrestation.id,
            quantity: line.quantity,
            unitPrice: chosenPrestation.unitPrice,
            description: line.description,
          })
        );
        totalLines++;
      }

      // Update invoice total from actual lines
      await invoiceRepo.save({ id: invoice.id, total: Math.round(invoiceTotal * 100) / 100 });

      // Progress logging every 50 invoices
      if (totalCreated % 50 === 0) {
        console.log(`  ✓ ${totalCreated} invoices created, ${totalLines} lines total`);
      }
    }
  }

  console.log(`  [invoices] ${totalCreated} created, ${totalLines} lines total`);
}
