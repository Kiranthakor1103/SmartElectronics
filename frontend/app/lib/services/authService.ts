const API_URL = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || localStorage.getItem("authToken");
}

async function parseAuthResponse(res: Response) {
  const data = await res.json().catch(() => ({
    success: false,
    message: "Server returned an invalid response",
  }));

  if (!res.ok) {
    return {
      ...data,
      success: false,
      status: res.status,
      message: data.message || `Request failed with status ${res.status}`,
    };
  }

  return data;
}

export const authService = {
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseAuthResponse(res);
      if (data && data.success && typeof window !== "undefined") {
        const userObj = data.data?.user || (data.data && (data.data.name || data.data.email) ? data.data : null) || data.user;
        const tokenStr = data.data?.token || data.token || data.accessToken;
        
        if (userObj) {
          localStorage.setItem("user", JSON.stringify(userObj));
        }
        if (tokenStr) {
          localStorage.setItem("token", tokenStr);
          localStorage.setItem("authToken", tokenStr);
        }
      }
      return data;
    } catch (err: any) {
      console.warn("authService.login error:", err.message);
      return { success: false, message: err.message || "Login failed" };
    }
  },

  async register(name: string, email: string, password: string) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await parseAuthResponse(res);
      if (data && data.success && typeof window !== "undefined") {
        const userObj = data.data?.user || (data.data && (data.data.name || data.data.email) ? data.data : null) || data.user;
        const tokenStr = data.data?.token || data.token || data.accessToken;

        if (userObj) {
          localStorage.setItem("user", JSON.stringify(userObj));
        }
        if (tokenStr) {
          localStorage.setItem("token", tokenStr);
          localStorage.setItem("authToken", tokenStr);
        }
      }
      return data;
    } catch (err: any) {
      console.warn("authService.register error:", err.message);
      return { success: false, message: err.message || "Registration failed" };
    }
  },

  async googleLogin(idToken: string) {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: idToken }),
      });
      const data = await parseAuthResponse(res);
      if (data && data.success && typeof window !== "undefined") {
        const userObj = data.data?.user || (data.data && (data.data.name || data.data.email) ? data.data : null) || data.user;
        const tokenStr = data.data?.token || data.token || data.accessToken;

        if (userObj) {
          localStorage.setItem("user", JSON.stringify(userObj));
        }
        if (tokenStr) {
          localStorage.setItem("token", tokenStr);
          localStorage.setItem("authToken", tokenStr);
        }
      }
      return data;
    } catch (err: any) {
      console.warn("authService.googleLogin error:", err.message);
      return { success: false, message: err.message || "Google authentication failed" };
    }
  },

  async logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});
    } catch {}

    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "authToken=; path=/; max-age=0; SameSite=Lax";
      window.dispatchEvent(new Event("auth-change"));
    }
    return { success: true, message: "Logged out successfully" };
  },

  async getMe() {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: "Unauthenticated", user: null };
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`${API_URL}/auth/me?_=${Date.now()}`, {
        method: "GET",
        credentials: "include",
        headers,
        cache: "no-store",
      });
      const data = await parseAuthResponse(res);

      if (data && data.success && typeof window !== "undefined") {
        const userObj = data.data?.user || (data.data && (data.data.name || data.data.email) ? data.data : null) || data.user;
        if (userObj && typeof userObj === "object") {
          localStorage.setItem("user", JSON.stringify(userObj));
        }
      } else if (data && data.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
      }
      return data;
    } catch (err: any) {
      console.warn("authService.getMe error:", err.message);
      return { success: false, message: "Unauthenticated", user: null };
    }
  },

  async updateProfile(profileData: { name?: string; phone?: string; address?: string }) {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: "Unauthenticated" };
      }

      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await parseAuthResponse(res);
      if (data && data.success && typeof window !== "undefined") {
        const userObj = data.data?.user || (data.data && (data.data.name || data.data.email) ? data.data : null) || data.user;
        if (userObj) {
          localStorage.setItem("user", JSON.stringify(userObj));
          window.dispatchEvent(new Event("auth-change"));
        }
      }
      return data;
    } catch (err: any) {
      console.warn("authService.updateProfile error:", err.message);
      return { success: false, message: err.message || "Failed to update profile" };
    }
  },

  async forgotPassword(email: string, portal: "customer" | "admin" = "customer") {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, portal }),
      });
      return await parseAuthResponse(res);
    } catch (err: any) {
      console.warn("authService.forgotPassword error:", err.message);
      return { success: false, message: err.message || "Failed to send reset link" };
    }
  },

  async resetPassword(token: string, password: string, confirmPassword?: string) {
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      return await parseAuthResponse(res);
    } catch (err: any) {
      console.warn("authService.resetPassword error:", err.message);
      return { success: false, message: err.message || "Failed to reset password" };
    }
  },
};

