import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // Ubah nama state menyesuaikan Dual Token
    accessToken: localStorage.getItem("hvas_access_token") || null,
    refreshToken: localStorage.getItem("hvas_refresh_token") || null,
    userRole: localStorage.getItem("role") || null,
    user: null,
  }),

  getters: {
    // Autentikasi kini bergantung pada keberadaan access token
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.userRole === "admin",
    isTeknisi: (state) => state.userRole === "teknisi",
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.post("/auth/login", { username, password });

        // 1. Ekstrak Dual Token dari respon backend
        const accessToken = response.data.accessToken;
        const refreshToken = response.data.refreshToken;
        const role = response.data.role;

        // 2. Simpan ke State Pinia
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userRole = role;

        // 3. Simpan ke Local Storage dengan kunci (key) yang tepat
        localStorage.setItem("hvas_access_token", accessToken);
        localStorage.setItem("hvas_refresh_token", refreshToken);
        localStorage.setItem("role", role);

        return { success: true, role: role };
      } catch (error) {
        return {
          success: false,
          message:
            error.response?.data?.message || "Gagal terhubung ke peladen.",
        };
      }
    },

    async register(username, password, nama, peran) {
      try {
        const response = await api.post("/auth/register", {
          username,
          password,
          nama,
          peran,
        });
        return { success: true, message: response.data.message };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "Gagal mendaftar.",
        };
      }
    },

    async logout() {
      // 1. Tembak API Logout agar backend menghapus token dari database (Single Session)
      try {
        if (this.accessToken) {
          await api.post("/auth/logout");
        }
      } catch (error) {
        console.error("Gagal mematikan sesi di database peladen:", error);
      }

      // 2. Hapus state dari memori Vue
      this.accessToken = null;
      this.refreshToken = null;
      this.userRole = null;
      this.user = null;

      // 3. Bersihkan sisa token di Local Storage
      localStorage.removeItem("hvas_access_token");
      localStorage.removeItem("hvas_refresh_token");
      localStorage.removeItem("role");

      // Opsional: Hapus kunci lama agar bersih 100%
      localStorage.removeItem("hvas_jwt_token");
    },
  },
});
