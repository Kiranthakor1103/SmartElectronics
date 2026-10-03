import { ApiClient } from "./apiClient";

export class AuthApi {
  static async register(userData: Record<string, unknown>) {
    return ApiClient.post("/auth/register", userData);
  }

  static async login(credentials: Record<string, unknown>) {
    return ApiClient.post("/auth/login", credentials);
  }

  static async googleAuth(credential: string) {
    return ApiClient.post("/auth/google", { credential });
  }

  static async getMe() {
    return ApiClient.get("/auth/me");
  }
}
