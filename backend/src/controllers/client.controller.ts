import { withTransaction } from '../helpers/with-transaction.helper.js';
import { ClientRepository } from '../repositories/client.repository.js';
import type { CreateClientInput, IdParamInput, UpdateClientInput } from '@chdev/common';
import type { Request, Response } from 'express';
import type { PaginatedRequest } from '../middlewares/pagination.middleware.js';
import type { TypedRequest } from '../middlewares/validate.middleware.js';

export class ClientController {
  async getAll(_req: Request, res: Response) {
    const repository = ClientRepository.create();
    const clients = await repository.findAll();
    res.json(clients);
  }

  async getAllPaginated({ query }: PaginatedRequest, res: Response) {
    const repository = ClientRepository.create();
    const [clients, total] = await repository.findAllPaginated(query);
    res.json({ data: clients, total });
  }

  async getById(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const repository = ClientRepository.create();
    const client = await repository.findById(id);
    if (!client) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(client);
  }

  async create({ body }: TypedRequest<CreateClientInput>, res: Response) {
    const result = await withTransaction(async (transaction) => {
      const repository = ClientRepository.create(transaction);
      const saved = await repository.create(body);
      return repository.findById(saved.id);
    });
    res.status(201).json(result);
  }

  async update({ body, params }: TypedRequest<UpdateClientInput, IdParamInput>, res: Response) {
    const { id } = params;
    const updated = await withTransaction(async (transaction) => {
      const repository = ClientRepository.create(transaction);
      const updated = await repository.update(id, body);
      if (!updated) {
        return res.status(404).json({ error: 'Not found' });
      }
      return updated;
    });
    res.json(updated);
  }

  async remove(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const result = await withTransaction(async (transaction) => {
      const repository = ClientRepository.create(transaction);
      return repository.delete(id);
    });
    if (result.affected === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).send();
  }

  async getInvoicesByClientId(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const repository = ClientRepository.create();
    const invoices = await repository.findInvoicesByClientId(id);
    if (!invoices) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(invoices);
  }
}

export const clientController = new ClientController();
