import axios from "axios";

const isDev = import.meta.env.DEV;
const baseURL = isDev ? import.meta.env.VITE_API_URL : "/api";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hvas_jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
