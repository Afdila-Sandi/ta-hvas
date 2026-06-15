import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Riwayat from "../views/Riwayat.vue";

// Perbaikan Import: Pastikan nama import sama dengan nama komponen yang dipanggil di routes
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
      path: "/admin",
      name: "AdminDashboard",
      component: AdminDashboard,
      meta: { requiresAuth: true, role: "admin" },
    },
    {
      path: "/teknisi",
      name: "TeknisiDashboard",
      component: TeknisiDashboard,
      meta: { requiresAuth: true, role: "teknisi" },
    },
    {
      path: "/riwayat",
      name: "Riwayat",
      component: Riwayat,
    },
  ],
});

// Tes tanpa token jwt
// router.beforeEach((to, from, next) => {
//   const publicPages = ["/login"];
//   const authRequired = !publicPages.includes(to.path);
//   const loggedIn = localStorage.getItem("hvas_jwt_token");

//   if (authRequired && !loggedIn) {
//     return next("/login");
//   }
//   next();
// });

export default router;
