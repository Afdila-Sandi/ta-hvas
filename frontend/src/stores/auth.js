import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("hvas_jwt_token") || null,
    userRole: localStorage.getItem("role") || null, // Tambahan: Baca role dari localStorage
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.userRole === "admin", // Tambahan opsional: Cek apakah admin
    isTeknisi: (state) => state.userRole === "teknisi", // Tambahan opsional: Cek apakah teknisi
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.post("/auth/login", { username, password });

        // Tangkap token dan role dari respon backend
        const token = response.data.token;
        const role = response.data.role;

        // 1. Simpan ke state Pinia
        this.token = token;
        this.userRole = role;

        // 2. Simpan ke localStorage agar tidak hilang saat browser di-refresh
        localStorage.setItem("hvas_jwt_token", token);
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

    logout() {
      // 1. Bersihkan state Pinia
      this.token = null;
      this.userRole = null;
      this.user = null;

      // 2. Bersihkan localStorage
      localStorage.removeItem("hvas_jwt_token");
      localStorage.removeItem("role"); // Tambahan: Hapus role saat logout
    },
  },
});
