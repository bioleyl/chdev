import { ApiService } from './api.service';
import type {
  CreatePrestationInput,
  PaginatedResponse,
  PaginationInput,
  Prestation,
  UpdatePrestationInput,
} from '@chdev/common';

export class PrestationService {
  static getAll() {
    return ApiService.get<Array<Prestation>>('/prestations');
  }

  static getAllPaginated(params: PaginationInput) {
    return ApiService.paginate<PaginatedResponse<Prestation>>('/prestations/paginated', params);
  }

  static getById(id: number) {
    return ApiService.get<Prestation>(`/prestations/${id}`);
  }

  static create(data: CreatePrestationInput) {
    return ApiService.post<Prestation>('/prestations', data);
  }

  static update(data: UpdatePrestationInput) {
    return ApiService.put<Prestation>(`/prestations/${data.id}`, data);
  }

  static delete(id: number) {
    return ApiService.delete(`/prestations/${id}`);
  }
}
