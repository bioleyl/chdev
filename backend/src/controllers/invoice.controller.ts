import { withTransaction } from '../helpers/with-transaction.helper.js';
import { InvoiceRepository } from '../repositories/invoice.repository.js';
import { InvoiceLineRepository } from '../repositories/invoice-line.repository.js';
import { invoicePdfService, sanitizeFilename } from '../services/invoice-pdf.service.js';
import type { CreateInvoiceInput, IdParamInput, UpdateInvoiceInput } from '@chdev/common';
import type { Request, Response } from 'express';
import type { PaginatedRequest } from '../middlewares/pagination.middleware.js';
import type { TypedRequest } from '../middlewares/validate.middleware.js';

class InvoiceController {
  async getAll(_req: Request, res: Response) {
    const repository = InvoiceRepository.create();
    const invoices = await repository.findAll();
    res.json(invoices);
  }

  async getAllPaginated({ query }: PaginatedRequest, res: Response) {
    const repository = InvoiceRepository.create();
    const [invoices, total] = await repository.findAllPaginated(query);
    res.json({ data: invoices, total });
  }

  async getById(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const repository = InvoiceRepository.create();
    const invoice = await repository.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(invoice);
  }

  async create({ body }: TypedRequest<CreateInvoiceInput>, res: Response) {
    const saved = await withTransaction(async (transaction) => {
      const invoiceRepo = InvoiceRepository.create(transaction);
      const invoiceLineRepo = InvoiceLineRepository.create(transaction);
      const { lines, ...invoiceData } = body;
      const saved = await invoiceRepo.create({ ...invoiceData, lines });
      for (const line of lines ?? []) {
        await invoiceLineRepo.create({ ...line, invoiceId: saved.id });
      }
      return await invoiceRepo.findById(saved.id);
    });
    res.status(201).json(saved);
  }

  async update({ body, params }: TypedRequest<UpdateInvoiceInput, IdParamInput>, res: Response) {
    const { id } = params;
    const updated = await withTransaction(async (transaction) => {
      const invoiceRepo = InvoiceRepository.create(transaction);
      const invoiceLineRepo = InvoiceLineRepository.create(transaction);
      const { lines, ...invoiceData } = body;
      await invoiceLineRepo.deleteByInvoiceId(id);
      const updated = await invoiceRepo.update({ ...invoiceData, lines });
      if (!updated) {
        return res.status(404).json({ error: 'Not found' });
      }
      for (const line of lines ?? []) {
        await invoiceLineRepo.create({ ...line, invoiceId: id });
      }

      return await invoiceRepo.findById(id);
    });
    res.json(updated);
  }

  async remove(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const result = await withTransaction(async (transaction) => {
      const repository = InvoiceRepository.create(transaction);
      return repository.delete(id);
    });
    if (result.affected === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).send();
  }

  async downloadPdf(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const invoice = await withTransaction(async (transaction) => {
      const repository = InvoiceRepository.create(transaction);
      return repository.findById(id);
    });
    if (!invoice) {
      return res.status(404).json({ error: 'Not found' });
    }
    const pdfBuffer = await invoicePdfService.generateInvoicePdf(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    // Use sanitizeFilename to handle Windows-invalid characters (including / and \)
    const safeNumber = sanitizeFilename(invoice.number);
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${safeNumber}.pdf"`);
    res.send(pdfBuffer);
  }
}

export const invoiceController = new InvoiceController();
