const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  products?: T;
  categories?: T;
  suggestions?: string[];
  count?: number;
  pagination?: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
  errors?: unknown;
}

export class ApiClient {
  private static getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...extraHeaders,
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static inFlightRequests = new Map<string, Promise<ApiResponse<unknown>>>();

  static async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const method = (options.method || "GET").toUpperCase();
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    // Deduplicate concurrent GET requests to the exact same URL
    if (method === "GET") {
      const inFlight = this.inFlightRequests.get(url);
      if (inFlight) {
        return inFlight as Promise<ApiResponse<T>>;
      }
    }

    const headers = this.getHeaders((options.headers as Record<string, string>) || {});

    const fetchPromise = (async () => {
      try {
        const response = await fetch(url, {
          cache: options.cache ?? "no-store",
          ...options,
          headers,
        });

        let data: Record<string, unknown> = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = (await response.json()) as Record<string, unknown>;
        } else {
          const text = await response.text();
          data = { message: text || response.statusText };
        }

        if (!response.ok) {
          throw new Error((data.message as string) || `API request failed with status ${response.status}`);
        }

        return data as unknown as ApiResponse<T>;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Network request failed";
        if (process.env.NODE_ENV === "development") {
          console.warn(`[ApiClient] ${options.method || "GET"} ${endpoint} unreachable (${msg}). Using repository fallback.`);
        }
        return {
          success: false,
          message: msg,
        } as ApiResponse<T>;
      } finally {
        if (method === "GET") {
          this.inFlightRequests.delete(url);
        }
      }
    })();

    if (method === "GET") {
      this.inFlightRequests.set(url, fetchPromise as Promise<ApiResponse<unknown>>);
    }

    return fetchPromise;
  }

  static async get<T = unknown>(endpoint: string, queryParams: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
    const queryString = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        queryString.append(key, String(val));
      }
    });

    const queryStr = queryString.toString();
    const fullEndpoint = queryStr ? `${endpoint}?${queryStr}` : endpoint;
    return this.request<T>(fullEndpoint, { method: "GET" });
  }

  static async post<T = unknown>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static async put<T = unknown>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static async patch<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}
