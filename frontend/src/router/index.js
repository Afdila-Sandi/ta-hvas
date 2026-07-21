import { createRouter, createWebHistory } from "vue-router";

const Login = () => import("../views/Login.vue");
const TeknisiDashboard = () => import("../views/TeknisiDashboard.vue");
const AdminDashboard = () => import("../views/AdminDashboard.vue");
const PenyeliaDashboard = () => import("../views/PenyeliaDashboard.vue");

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
    {
      path: "/penyeliaDashboard",
      name: "PenyeliaDashboard",
      component: PenyeliaDashboard,
      meta: { requiresAuth: true, role: "penyelia" },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const token = localStorage.getItem("hvas_access_token");

  if (requiresAuth && !token) {
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
        if (userRole === "penyelia") return next("/penyeliaDashboard");
      }
    } catch (error) {
      localStorage.removeItem("hvas_access_token");
      localStorage.removeItem("role");
      return next("/login");
    }
  }

  if ((to.path === "/login" || to.path === "/") && token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const decodedJson = atob(payloadBase64);
      const userData = JSON.parse(decodedJson);
      if (userData.role === "admin") return next("/adminDashboard");
      if (userData.role === "penyelia") return next("/penyeliaDashboard");
      return next("/teknisiDashboard");
    } catch (e) {
      // token invalid, biarkan ke login
    }
  }
  next();
});

export default router;
