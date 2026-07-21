<template>
  <div
    class="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden"
  >
    <AdminSidebar
      :activeMenu="currentMenu"
      :userName="adminName"
      :userRole="adminRole"
      @changeMenu="currentMenu = $event"
      @logout="prosesLogoutAdmin"
    />

    <main class="flex-1 overflow-y-auto p-8 lg:p-12 relative">
      <div v-if="currentMenu === 'dashboard'" class="space-y-6">
        <div v-if="sesiAktif.length > 0" class="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <i class="fa-solid fa-user-check text-amber-600"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-amber-800">Sesi Sampling Aktif</p>
              <p class="text-xs text-amber-600">{{ sesiAktif.length }} teknisi sedang melakukan sampling</p>
            </div>
          </div>
          <div class="space-y-2 mt-3">
            <div v-for="sesi in sesiAktif" :key="sesi.id" class="bg-white rounded-xl p-3 border border-amber-100">
              <p class="text-sm font-bold text-slate-800">{{ sesi.nama_teknisi }} — {{ sesi.perusahaan }}</p>
              <p class="text-xs text-slate-500">{{ sesi.tempat_sampling }} · {{ sesi.parameter_uji }}</p>
              <p class="text-[10px] text-slate-400">{{ formatTanggal(sesi.waktu_mulai) }} · Cuaca: {{ sesi.kondisi_cuaca }}</p>
            </div>
          </div>
        </div>

        <AdminStatistik v-if="currentMenu === 'dashboard'" />
      </div>

      <AdminLaporan v-if="currentMenu === 'laporan'" />

      <div v-if="currentMenu === 'profil'" class="flex justify-center pt-10">
        <AdminProfil />
      </div>

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
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
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

              <div class="flex items-center gap-3">
                <div
                  class="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg hidden sm:block uppercase tracking-wider"
                >
                  {{ teknisi.peran }}
                </div>

                <button
                  @click="bukaModalEdit(teknisi)"
                  class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all active:scale-95"
                >
                  <i class="fa-solid fa-pen text-sm"></i>
                </button>

                <button
                  @click="hapusTeknisi(teknisi.id)"
                  class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-all active:scale-95"
                >
                  <i class="fa-solid fa-trash text-sm"></i>
                </button>
              </div>
            </li>

            <li
              v-if="daftarTeknisi.length === 0"
              class="p-8 text-center text-slate-400 text-sm font-medium"
            >
              Belum ada data teknisi yang terdaftar.
            </li>
          </ul>
        </div>
      </div>
    </main>

    <AddUserModal
      v-if="isModalOpen"
      @close="isModalOpen = false"
      @success="handleUserAdded"
    />

    <EditUserModal
      v-if="isEditModalOpen"
      :userData="selectedUser"
      @close="isEditModalOpen = false"
      @success="handleUserEdited"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../services/api";

import AdminSidebar from "../components/AdminSidebar.vue";
import AdminStatistik from "../components/AdminStatistik.vue";
import AdminLaporan from "../components/AdminLaporan.vue";
import AddUserModal from "../components/AddUserModal.vue";
import EditUserModal from "../components/EditUserModal.vue";
import AdminProfil from "../components/AdminProfil.vue";

const authStore = useAuthStore();
const router = useRouter();

const currentMenu = ref("dashboard");
const isModalOpen = ref(false);

const isEditModalOpen = ref(false);
const selectedUser = ref(null);

const adminName = ref("Memuat...");
const adminRole = ref("Admin");
const daftarTeknisi = ref([]);
const sesiAktif = ref([]);

const parseWaktuWIB = (waktuStr) => {
  return new Date(waktuStr.replace(/Z$/, "").replace(/\+00:00$/, "") + "+07:00");
};

const formatTanggal = (waktu) => {
  return parseWaktuWIB(waktu).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fetchData = async () => {
  try {
    const profileRes = await api.get("/auth/profile");
    adminName.value = profileRes.data.nama;
    adminRole.value = profileRes.data.peran;

    const usersRes = await api.get("/auth/users");
    daftarTeknisi.value = usersRes.data.filter(u => u.peran !== 'admin');

    const sesiRes = await api.get("/telemetry/sampling/all-active");
    sesiAktif.value = sesiRes.data.sessions || [];
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    if (error.response?.status === 401) prosesLogoutAdmin();
  }
};

const handleUserAdded = () => {
  isModalOpen.value = false;
  fetchData();
};

const bukaModalEdit = (teknisi) => {
  selectedUser.value = teknisi;
  isEditModalOpen.value = true;
};

const handleUserEdited = () => {
  isEditModalOpen.value = false;
  fetchData();
};

const hapusTeknisi = async (id) => {
  if (confirm("Apakah Anda yakin ingin menghapus akun ini secara permanen?")) {
    try {
      await api.delete(`/auth/users/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus pengguna.");
    }
  }
};



const prosesLogoutAdmin = async () => {
  if (confirm("Yakin ingin keluar?")) {
    await authStore.logout();
    router.push("/login");
  }
};

onMounted(() => {
  fetchData();
});
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
