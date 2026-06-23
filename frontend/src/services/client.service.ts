import { ApiService } from './api.service';
import type {
  Client,
  CreateClientInput,
  Invoice,
  PaginatedResponse,
  PaginationInput,
  UpdateClientInput,
} from '@chdev/common';

export class ClientService {
  static getAll() {
    return ApiService.get<Array<Client>>('/clients');
  }

  static getAllPaginated(params: PaginationInput) {
    return ApiService.paginate<PaginatedResponse<Client>>('/clients/paginated', params);
  }

  static getById(id: number) {
    return ApiService.get<Client>(`/clients/${id}`);
  }

  static create(data: CreateClientInput) {
    return ApiService.post<Client>('/clients', data);
  }

  static update(id: number, data: UpdateClientInput) {
    return ApiService.put<Client>(`/clients/${id}`, data);
  }

  static delete(id: number) {
    return ApiService.delete(`/clients/${id}`);
  }

  static getInvoicesByClientId(id: number) {
    return ApiService.get<Array<Invoice>>(`/clients/${id}/invoices`);
  }
}
