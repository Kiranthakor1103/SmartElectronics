export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export class ApiClient {
  private static getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      let token =
        localStorage.getItem('adminToken') ||
        localStorage.getItem('token');

      if (!token) {
        const cookieMatch = document.cookie
          .split('; ')
          .find((row) => row.startsWith('adminToken=') || row.startsWith('token='));
        if (cookieMatch) {
          token = cookieMatch.split('=')[1];
        }
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static handleAuthError(status: number) {
    if (typeof window !== 'undefined' && (status === 401 || status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      document.cookie = 'adminToken=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';

      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  private static async parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await res.json()) as ApiResponse<T>;
      }
      const text = await res.text();
      return {
        success: false,
        message: text || res.statusText || `Request failed with status ${res.status}`,
      } as ApiResponse<T>;
    } catch (err) {
      return {
        success: false,
        message: `Failed to parse response (${res.status} ${res.statusText}): ${err instanceof Error ? err.message : String(err)}`,
      } as ApiResponse<T>;
    }
  }

  private static inFlightRequests = new Map<string, Promise<ApiResponse<any>>>();

  static async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    if (this.inFlightRequests.has(endpoint)) {
      return this.inFlightRequests.get(endpoint) as Promise<ApiResponse<T>>;
    }

    const fetchPromise = (async () => {
      try {
        const res = await fetch(`/api${endpoint}`, {
          method: 'GET',
          headers: this.getHeaders(),
          cache: 'no-store',
        });
        if (res.status === 401 || res.status === 403) {
          this.handleAuthError(res.status);
        }
        return await this.parseResponse<T>(res);
      } catch (err) {
        console.error(`[ApiClient GET ${endpoint}] Error:`, err);
        return { success: false, message: 'Network request failed' } as ApiResponse<T>;
      } finally {
        this.inFlightRequests.delete(endpoint);
      }
    })();

    this.inFlightRequests.set(endpoint, fetchPromise as Promise<ApiResponse<any>>);
    return fetchPromise;
  }

  static async post<T = any>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data !== undefined ? JSON.stringify(data) : undefined,
      });
      if (res.status === 401 || res.status === 403) {
        this.handleAuthError(res.status);
      }
      return await this.parseResponse<T>(res);
    } catch (err) {
      console.error(`[ApiClient POST ${endpoint}] Error:`, err);
      return { success: false, message: 'Network request failed' } as ApiResponse<T>;
    }
  }

  static async put<T = any>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`/api${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data !== undefined ? JSON.stringify(data) : undefined,
      });
      if (res.status === 401 || res.status === 403) {
        this.handleAuthError(res.status);
      }
      return await this.parseResponse<T>(res);
    } catch (err) {
      console.error(`[ApiClient PUT ${endpoint}] Error:`, err);
      return { success: false, message: 'Network request failed' } as ApiResponse<T>;
    }
  }

  static async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`/api${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        this.handleAuthError(res.status);
      }
      return await this.parseResponse<T>(res);
    } catch (err) {
      console.error(`[ApiClient DELETE ${endpoint}] Error:`, err);
      return { success: false, message: 'Network request failed' } as ApiResponse<T>;
    }
  }

  static async patch<T = any>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`/api${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: data !== undefined ? JSON.stringify(data) : undefined,
      });
      if (res.status === 401 || res.status === 403) {
        this.handleAuthError(res.status);
      }
      return await this.parseResponse<T>(res);
    } catch (err) {
      console.error(`[ApiClient PATCH ${endpoint}] Error:`, err);
      return { success: false, message: 'Network request failed' } as ApiResponse<T>;
    }
  }

  static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const method = (options.method || 'GET').toUpperCase();
      const headers = {
        ...((this.getHeaders() as Record<string, string>) || {}),
        ...((options.headers as Record<string, string>) || {}),
      };

      const res = await fetch(`/api${endpoint}`, {
        ...options,
        method,
        headers,
      });
      if (res.status === 401 || res.status === 403) {
        this.handleAuthError(res.status);
      }
      return await this.parseResponse<T>(res);
    } catch (err) {
      console.error(`[ApiClient ${options.method || 'REQUEST'} ${endpoint}] Error:`, err);
      return { success: false, message: 'Network request failed' } as ApiResponse<T>;
    }
  }

  static async downloadFile(endpoint: string, fallbackFilename: string): Promise<boolean> {
    try {
      const res = await fetch(`/api${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
        cache: 'no-store',
      });

      if (res.status === 401 || res.status === 403) {
        this.handleAuthError(res.status);
        return false;
      }

      if (!res.ok) {
        let errorMsg = `Server error ${res.status}`;
        try {
          const errJson = await res.json();
          errorMsg = errJson.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      // Extract filename from Content-Disposition if provided by backend
      let filename = fallbackFilename;
      const disposition = res.headers.get('content-disposition');
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '').trim();
        }
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error(`[ApiClient downloadFile ${endpoint}] Error:`, err);
      throw err;
    }
  }
}
