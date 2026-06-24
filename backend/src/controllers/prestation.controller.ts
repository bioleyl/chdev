import { withTransaction } from '../helpers/with-transaction.helper.js';
import { PrestationRepository } from '../repositories/prestation.repository.js';
import type { CreatePrestationInput, IdParamInput, UpdatePrestationInput } from '@chdev/common';
import type { Request, Response } from 'express';
import type { PaginatedRequest } from '../middlewares/pagination.middleware.js';
import type { TypedRequest } from '../middlewares/validate.middleware.js';

class PrestationController {
  async getAll(_req: Request, res: Response) {
    const repository = PrestationRepository.create();
    const prestations = await repository.findAll();
    res.json(prestations);
  }

  async getAllPaginated({ query }: PaginatedRequest, res: Response) {
    const repository = PrestationRepository.create();
    const [prestations, total] = await repository.findAllPaginated(query);
    res.json({ data: prestations, total });
  }

  async getById(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const repository = PrestationRepository.create();
    const prestation = await repository.findById(id);
    if (!prestation) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(prestation);
  }

  async create({ body }: TypedRequest<CreatePrestationInput>, res: Response) {
    const saved = await withTransaction(async (transaction) => {
      const repository = PrestationRepository.create(transaction);
      return repository.create(body);
    });
    res.status(201).json(saved);
  }

  async update({ body, params }: TypedRequest<UpdatePrestationInput, IdParamInput>, res: Response) {
    const { id } = params;
    const updated = await withTransaction(async (transaction) => {
      const repository = PrestationRepository.create(transaction);
      return repository.update(id, body);
    });
    if (!updated) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(updated);
  }

  async remove(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const result = await withTransaction(async (transaction) => {
      const repository = PrestationRepository.create(transaction);
      return repository.delete(id);
    });
    if (result.affected === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).send();
  }
}

export const prestationController = new PrestationController();
