import { cleanObject } from '@chdev/common';
import { AuthService } from './auth.service';
import type { PaginationInput } from '@chdev/common';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Something went wrong');
  }
  return response.json();
}

async function handleBlob(response: Response): Promise<Blob> {
  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Something went wrong');
  }
  return response.blob();
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = AuthService.getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse<T>(response);
}

export const ApiService = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  getBlob: (endpoint: string) => {
    const token = AuthService.getToken();
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(`${API_BASE_URL}${endpoint}`, { headers }).then(handleBlob);
  },
  paginate: <T>(endpoint: string, queryParams: PaginationInput) => {
    const cleanedParams = cleanObject(queryParams);
    const params = new URLSearchParams(cleanedParams as Record<string, string>);
    return request<T>(`${endpoint}?${params.toString()}`);
  },
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
