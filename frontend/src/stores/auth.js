import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
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

        const accessToken = response.data.accessToken;
        const role = response.data.role;

        this.accessToken = accessToken;
        this.userRole = role;

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
      try {
        if (this.accessToken) {
          await api.post("/auth/logout");
        }
      } catch (error) {
        console.error("Gagal mematikan sesi di database peladen:", error);
      }

      this.accessToken = null;
      this.userRole = null;
      this.user = null;

      localStorage.removeItem("hvas_access_token");
      localStorage.removeItem("role");
    },
  },
});
