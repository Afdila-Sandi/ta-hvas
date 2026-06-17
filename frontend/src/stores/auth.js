import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("hvas_jwt_token") || null,
    userRole: localStorage.getItem("role") || null, 
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.userRole === "admin", 
    isTeknisi: (state) => state.userRole === "teknisi", 
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.post("/auth/login", { username, password });

        const token = response.data.token;
        const role = response.data.role;

        this.token = token;
        this.userRole = role;

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
      this.token = null;
      this.userRole = null;
      this.user = null;

      localStorage.removeItem("hvas_jwt_token");
      localStorage.removeItem("role"); 
    },
  },
});
