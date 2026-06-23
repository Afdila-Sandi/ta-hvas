import axios from "axios";

const isDev = import.meta.env.DEV;
const baseURL = isDev ? import.meta.env.VITE_API_URL : "/api";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // WAJIB: Mengizinkan pengiriman dan penerimaan Cookie
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

      try {
        // PERUBAHAN: Tidak perlu mencari refresh token di localStorage.
        // Langsung tembak endpoint refresh, Cookie akan terkirim otomatis oleh peramban.
        const res = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true, // Pastikan request axios mandiri ini juga membawa cookie
          },
        );

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
  // Hanya hapus access_token, refresh token diurus oleh backend
  localStorage.removeItem("hvas_access_token");
  localStorage.removeItem("role");

  // Hapus sisa-sisa kunci lama jika masih ada
  localStorage.removeItem("hvas_jwt_token");
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
