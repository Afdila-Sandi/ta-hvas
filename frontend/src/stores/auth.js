import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // Refresh Token dihapus dari state karena sekarang diurus otomatis oleh browser (Cookie)
    accessToken: localStorage.getItem("hvas_access_token") || null,
    userRole: localStorage.getItem("role") || null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.userRole === "admin",
    isTeknisi: (state) => state.userRole === "teknisi",
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.post("/auth/login", { username, password });

        // 1. Backend sekarang HANYA mengirim access token di response body
        // (Refresh token diam-diam sudah diselipkan backend ke dalam Cookie)
        const accessToken = response.data.accessToken;
        const role = response.data.role;

        // 2. Simpan ke State Pinia
        this.accessToken = accessToken;
        this.userRole = role;

        // 3. Simpan HANYA access token & role ke Local Storage
        localStorage.setItem("hvas_access_token", accessToken);
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
      // 1. Tembak API Logout agar backend menghapus token dari database
      // DAN backend akan memberikan perintah untuk menghapus Cookie dari browser
      try {
        if (this.accessToken) {
          await api.post("/auth/logout");
        }
      } catch (error) {
        console.error("Gagal mematikan sesi di database peladen:", error);
      }

      // 2. Hapus state dari memori Vue
      this.accessToken = null;
      this.userRole = null;
      this.user = null;

      // 3. Bersihkan sisa access token di Local Storage
      localStorage.removeItem("hvas_access_token");
      localStorage.removeItem("role");

      // Bersihkan sisa kode lama jika masih ada
      localStorage.removeItem("hvas_jwt_token");
      localStorage.removeItem("hvas_refresh_token");
    },
  },
});
