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

  const token = localStorage.getItem("hvas_access_token");

  if (requiresAuth && !token) {
    alert("Silakan login terlebih dahulu.");
    return next("/login");
  }

  if (requiresAuth && token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const decodedJson = atob(payloadBase64);
      const userData = JSON.parse(decodedJson);
      const userRole = userData.role;

      if (to.meta.role && to.meta.role !== userRole) {
        if (userRole === "teknisi") return next("/teknisiDashboard");
        if (userRole === "admin") return next("/adminDashboard");
      }
    } catch (error) {
      localStorage.removeItem("hvas_access_token");
      localStorage.removeItem("hvas_refresh_token");
      localStorage.removeItem("role");
      return next("/login");
    }
  }

  if ((to.path === "/login" || to.path === "/") && token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const decodedJson = atob(payloadBase64);
      const userData = JSON.parse(decodedJson);
      return next(
        userData.role === "admin" ? "/adminDashboard" : "/teknisiDashboard",
      );
    } catch (e) {
    }
  }
  next();
});

export default router;
