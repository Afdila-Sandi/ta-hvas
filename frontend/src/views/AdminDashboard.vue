<template>
  <div
    class="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden"
  >
    <AdminSidebar
      :activeMenu="currentMenu"
      :userName="adminName"
      :userRole="adminRole"
      @changeMenu="currentMenu = $event"
      @logout="handleLogout"
    />

    <main class="flex-1 overflow-y-auto p-8 lg:p-12 relative">
      <AdminStatistik v-if="currentMenu === 'dashboard'" />

      <AdminLaporan v-if="currentMenu === 'laporan'" />

      <div v-if="currentMenu === 'user'" class="space-y-6">
        <header class="flex justify-between items-end">
          <div>
            <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
              Manajemen Teknisi
            </h1>
            <p class="text-sm text-slate-500 mt-1">
              Kelola akses akun teknisi lapangan.
            </p>
          </div>
          <button
            @click="isModalOpen = true"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
          >
            <i class="fa-solid fa-plus mr-1"></i> Tambah Teknisi
          </button>
        </header>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
          <ul class="divide-y divide-slate-100">
            <li
              v-for="teknisi in daftarTeknisi"
              :key="teknisi.id"
              class="p-4 flex justify-between items-center hover:bg-slate-50 rounded-xl transition-colors"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase border border-slate-200"
                >
                  {{ teknisi.nama.substring(0, 2) }}
                </div>
                <div>
                  <strong class="text-slate-800 block capitalize">{{
                    teknisi.nama
                  }}</strong>
                  <span class="text-sm text-slate-500">{{
                    teknisi.username
                  }}</span>
                </div>
              </div>
              <div
                class="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg"
              >
                Aktif
              </div>
            </li>
          </ul>
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase border border-slate-200"
            >
              {{ teknisi.nama.substring(0, 2) }}
            </div>
            <div>
              <strong class="text-slate-800 block capitalize">{{
                teknisi.nama
              }}</strong>
              <span class="text-sm text-slate-500">{{ teknisi.username }}</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div
              class="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg hidden sm:block"
            >
              Aktif
            </div>

            <button
              @click="bukaModalEdit(teknisi)"
              class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
            >
              <i class="fa-solid fa-pen text-sm"></i>
            </button>

            <button
              @click="hapusTeknisi(teknisi.id)"
              class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
            >
              <i class="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </main>

    <AddUserModal
      v-if="isModalOpen"
      @close="isModalOpen = false"
      @success="handleUserAdded"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

import AdminSidebar from "../components/AdminSidebar.vue";
import AdminStatistik from "../components/AdminStatistik.vue";
import AdminLaporan from "../components/AdminLaporan.vue";
import AddUserModal from "../components/AddUserModal.vue";

const router = useRouter();

const currentMenu = ref("dashboard");
const isModalOpen = ref(false);

const adminName = ref("Afdila Sandi");
const adminRole = ref("Administrator");
const daftarTeknisi = ref([]);

const fetchData = async () => {
  try {
    // 1. Ambil nama profil asli dari database
    const profileRes = await api.get("/auth/profile");
    adminName.value = profileRes.data.nama;

    // Peran sebenarnya masih bisa dibaca dari token jika mau,
    // tapi karena API profile mengembalikan 'peran', kita pakai dari DB saja agar lebih aman.
    adminRole.value = profileRes.data.peran;

    // 2. Ambil daftar teknisi
    const usersRes = await api.get("/auth/users?role=teknisi");
    daftarTeknisi.value = usersRes.data;
  } catch (error) {
    console.error(
      "Gagal mengambil data dari server:",
      error.response?.data?.message || error.message,
    );

    // Fallback jika API gagal/error
    adminName.value = "Admin Tidak Diketahui";
    daftarTeknisi.value = [];

    // Jika errornya karena token tidak valid (401), paksa logout
    if (error.response?.status === 401) {
      handleLogout();
    }
  }
};

const handleUserAdded = () => {
  isModalOpen.value = false;
  alert("Akun teknisi baru berhasil ditambahkan!");
  fetchData();
};

const handleLogout = () => {
  localStorage.removeItem("hvas_jwt_token");
  localStorage.removeItem("role");
  router.push("/login");
};

onMounted(() => {
  fetchData();
});

const hapusTeknisi = async (id) => {
  if (
    confirm(
      "Apakah Anda yakin ingin menghapus akun teknisi ini secara permanen?",
    )
  ) {
    try {
      await api.delete(`/auth/users/${id}`);
      alert("Pengguna berhasil dihapus.");
      fetchData(); // Segarkan ulang tabel
    } catch (error) {
      alert(
        "Gagal menghapus pengguna: " +
          (error.response?.data?.message || "Terjadi kesalahan"),
      );
    }
  }
};
</script>

<style scoped>
main::-webkit-scrollbar {
  display: none;
}
main {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
