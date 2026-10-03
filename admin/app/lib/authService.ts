export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  phone?: string;
}

export class AdminAuthService {
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  }

  static getUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!token && user?.role === 'admin';
  }

  static logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      document.cookie = 'adminToken=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
      window.dispatchEvent(new Event('auth-change'));
      window.location.href = '/login';
    }
  }
}
