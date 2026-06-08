import { defineStore } from "pinia";
import api from "../services/api"; 
export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("hvas_jwt_token") || null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.post("/auth/login", { username, password });
        const token = response.data.token;

        this.token = token;
        localStorage.setItem("hvas_jwt_token", token);

        return { success: true, role: response.data.role };
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
      this.user = null;
      localStorage.removeItem("hvas_jwt_token");
    },
  },
});
