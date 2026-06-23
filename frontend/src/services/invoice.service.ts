import { ApiService } from './api.service';
import type {
  CreateInvoiceInput,
  Invoice,
  PaginatedResponse,
  PaginationInput,
  UpdateInvoiceInput,
} from '@chdev/common';

export class InvoiceService {
  static getAll(params: PaginationInput) {
    return ApiService.paginate<Array<Invoice>>('/invoices', params);
  }

  static getAllPaginated(params: PaginationInput) {
    return ApiService.paginate<PaginatedResponse<Invoice>>('/invoices/paginated', params);
  }

  static getById(id: number) {
    return ApiService.get<Invoice>(`/invoices/${id}`);
  }

  static create(data: CreateInvoiceInput) {
    return ApiService.post<Invoice>('/invoices', data);
  }

  static update(id: number, data: UpdateInvoiceInput) {
    return ApiService.put<Invoice>(`/invoices/${id}`, data);
  }

  static delete(id: number) {
    return ApiService.delete(`/invoices/${id}`);
  }

  static downloadPdf(id: number) {
    return ApiService.getBlob(`/invoices/${id}/download-pdf`);
  }
}
