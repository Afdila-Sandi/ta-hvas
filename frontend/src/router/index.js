import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import Riwayat from "../views/Riwayat.vue"; 

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
      path: "/register",
      name: "Register",
      component: Register,
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: Dashboard,
    },
    {
      path: "/riwayat",
      name: "Riwayat",
      component: Riwayat,
    },
  ],
});

//tes tanpa token jwt
//router.beforeEach((to, from, next) => {
//const publicPages = ["/login", "/register"];
//const authRequired = !publicPages.includes(to.path);
//const loggedIn = localStorage.getItem("hvas_jwt_token");

// if (authRequired && !loggedIn) {
// return next("/login");
//}
//next();
//});

export default router;
