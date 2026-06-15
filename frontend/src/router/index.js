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

// export default router;

// router.beforeEach((to, from, next) => {
//   // 1. Cek apakah halaman ini butuh login?
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
//   // 2. Ambil token dari penyimpanan
//   const token = localStorage.getItem("hvas_jwt_token");

//   // SKENARIO A: Halaman butuh login, tapi user tidak punya token
//   if (requiresAuth && !token) {
//     alert("Silakan login terlebih dahulu.");
//     return next("/login");
//   }

//   // SKENARIO B: Halaman butuh login dan user punya token. 
//   // Sekarang kita harus cek, apakah role-nya sesuai?
//   if (requiresAuth && token) {
//     try {
//       // Kita membelah JWT di level Router untuk melihat hak akses navigasi
//       const payloadBase64 = token.split(".")[1];
//       const decodedJson = atob(payloadBase64);
//       const userData = JSON.parse(decodedJson);
//       const userRole = userData.role;

//       // Cek meta.role dari routes vs role user dari token
//       if (to.meta.role && to.meta.role !== userRole) {
//         // Jika Teknisi mencoba masuk halaman /admin
//         if (userRole === "teknisi") return next("/teknisi");
//         // Jika Admin mencoba masuk halaman /teknisi (Opsional: Admin biasanya boleh kemana saja, tapi ini untuk kedisiplinan rute)
//         if (userRole === "admin") return next("/admin");
//       }
//     } catch (error) {
//        // Jika token rusak/dimanipulasi, hapus dan usir ke login
//        localStorage.removeItem("hvas_jwt_token");
//        return next("/login");
//     }
//   }

//   // SKENARIO C: User sudah login, tapi mencoba kembali ke halaman /login
//   if (to.path === "/login" && token) {
//      try {
//        const payloadBase64 = token.split(".")[1];
//        const decodedJson = atob(payloadBase64);
//        const userData = JSON.parse(decodedJson);
//        // Otomatis arahkan ke dashboard masing-masing
//        return next(userData.role === "admin" ? "/admin" : "/teknisi");
//      } catch (e) {
//        // Abaikan error jika token rusak
//      }
//   }

//   // Jika semua pengecekan aman, izinkan masuk ke halaman yang dituju
//   next();
// });

export default router;
