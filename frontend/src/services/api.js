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
  const token = localStorage.getItem("hvas_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("hvas_refresh_token");

      if (!refreshToken) {
        forceLogout("Sesi Anda telah berakhir. Silakan login kembali.");
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("hvas_access_token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        forceLogout(
          "Sesi digunakan di perangkat lain atau kedaluwarsa. Silakan login ulang.",
        );
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

function forceLogout(pesan) {
  localStorage.removeItem("hvas_access_token");
  localStorage.removeItem("hvas_refresh_token");

  if (!window.logoutAlertShown) {
    window.logoutAlertShown = true;
    alert(pesan);
    window.location.href = "/login";
    setTimeout(() => {
      window.logoutAlertShown = false;
    }, 3000);
  }
}

export default api;
