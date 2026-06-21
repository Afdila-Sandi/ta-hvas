import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import TeknisiDashboard from "../views/TeknisiDashboard.vue";
import AdminDashboard from "../views/AdminDashboard.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/adminDashboard",
      name: "AdminDashboard",
      component: AdminDashboard,
      meta: { requiresAuth: true, role: "admin" },
    },
    {
      path: "/teknisiDashboard",
      name: "TeknisiDashboard",
      component: TeknisiDashboard,
      meta: { requiresAuth: true, role: "teknisi" },
    },
  ],
});

router.beforeEach((to, from, next) => {

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // Ambil token dari penyimpanan
  const token = localStorage.getItem("hvas_jwt_token");

  // Halaman butuh login, tapi user tidak punya token
  if (requiresAuth && !token) {
    alert("Silakan login terlebih dahulu.");
    return next("/login");
  }

  // cek rute
  if (requiresAuth && token) {
    try {
      // melihat isi jwt
      const payloadBase64 = token.split(".")[1];
      const decodedJson = atob(payloadBase64);
      const userData = JSON.parse(decodedJson);
      const userRole = userData.role;

      if (to.meta.role && to.meta.role !== userRole) {
        // Jika Teknisi mencoba masuk halaman /adminDashboard
        if (userRole === "teknisi") return next("/teknisiDashboard");
        // Jika Admin mencoba masuk halaman /teknisiDashboard
        if (userRole === "admin") return next("/adminDashboard");
      }
    } catch (error) {
      // Jika token rusak/dimanipulasi, hapus dan usir ke login
      localStorage.removeItem("hvas_jwt_token");
      return next("/login");
    }
  }

  // User sudah login, tapi mencoba kembali ke halaman /login
  if (to.path === "/login" && token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const decodedJson = atob(payloadBase64);
      const userData = JSON.parse(decodedJson);
      return next(userData.role === "admin" ? "/adminDashboard" : "/teknisiDashboard");
    } catch (e) {
    }
  }

  next();
});

export default router;
