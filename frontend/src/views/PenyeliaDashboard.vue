<template>
  <div class="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
    <PenyeliaSidebar
      :activeMenu="currentMenu"
      :userName="penyeliaName"
      :userRole="penyeliaRole"
      @changeMenu="currentMenu = $event"
      @logout="prosesLogout"
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

        <PenyeliaStatistik />
      </div>

      <PenyeliaLaporan v-if="currentMenu === 'laporan'" />

      <PenyeliaUser v-if="currentMenu === 'user'" />

      <div v-if="currentMenu === 'profil'" class="flex justify-center pt-10">
        <PenyeliaProfil />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../services/api";

import PenyeliaSidebar from "../components/PenyeliaSidebar.vue";
import PenyeliaStatistik from "../components/PenyeliaStatistik.vue";
import PenyeliaLaporan from "../components/PenyeliaLaporan.vue";
import PenyeliaUser from "../components/PenyeliaUser.vue";
import PenyeliaProfil from "../components/PenyeliaProfil.vue";

const authStore = useAuthStore();
const router = useRouter();

const currentMenu = ref("dashboard");
const penyeliaName = ref("Memuat...");
const penyeliaRole = ref("Penyelia");
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
    penyeliaName.value = profileRes.data.nama;
    penyeliaRole.value = profileRes.data.peran;

    const sesiRes = await api.get("/telemetry/sampling/all-active");
    sesiAktif.value = sesiRes.data.sessions || [];
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    if (error.response?.status === 401) prosesLogout();
  }
};

const prosesLogout = async () => {
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
