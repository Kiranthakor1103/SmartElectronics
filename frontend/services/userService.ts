import { AuthApi } from "@/lib/api/authApi";

export class UserService {
  static async register(name: string, email: string, password: string) {
    const res = await AuthApi.register({ name, email, password });
    if (!res.success) {
      throw new Error(res.message || "Registration failed");
    }
    return res.data || res;
  }

  static async login(email: string, password: string) {
    const res = await AuthApi.login({ email, password });
    if (!res.success) {
      throw new Error(res.message || "Login failed");
    }
    return res.data || res;
  }

  static async googleLogin({ credential }: { credential: string }) {
    const res = await AuthApi.googleAuth(credential);
    if (!res.success) {
      throw new Error(res.message || "Google authentication failed");
    }
    return res.data || res;
  }

  static async getMe() {
    const res = await AuthApi.getMe();
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch profile");
    }
    return res.data;
  }
}
