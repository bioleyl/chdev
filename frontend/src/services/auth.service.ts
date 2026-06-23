import { jwtDecode } from 'jwt-decode';
import { ref } from 'vue';
import { ApiService } from './api.service';
import type { LoginInput, LoginResponse, Role } from '@chdev/common';

const TOKEN_KEY = 'authToken';

export class AuthService {
  static isLoggedIn = ref<boolean>(AuthService.isAuthenticated());

  static async login(data: LoginInput): Promise<boolean> {
    const { token } = await ApiService.post<LoginResponse>('/auth/login', data);
    AuthService.saveToken(token);
    AuthService.isLoggedIn.value = true;
    return true;
  }

  static saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    const token = AuthService.getToken();
    if (!token) {
      return false;
    }
    try {
      const decoded = jwtDecode(token);
      const isValid = !!decoded.exp && decoded.exp * 1000 > Date.now();
      return isValid;
    } catch (_e) {
      return false;
    }
  }

  static getUser(): { id: number; email: string; role: Role } | null {
    const token = AuthService.getToken();
    if (!token) {
      return null;
    }
    try {
      return jwtDecode(token);
    } catch (_e) {
      return null;
    }
  }

  static hasPermission(role: Role): boolean {
    const user = AuthService.getUser();
    if (!user) {
      return false;
    }
    if (user.role === 'ADMIN') {
      return true;
    }
    if (user.role === 'EDITOR' && (role === 'EDITOR' || role === 'VIEWER')) {
      return true;
    }
    return user.role === role;
  }

  static logout() {
    AuthService.removeToken();
    AuthService.isLoggedIn.value = false;
  }
}
