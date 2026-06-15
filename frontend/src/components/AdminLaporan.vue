<template>
  <div class="space-y-6">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
          Laporan Audit Kendali
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Riwayat aktivitas seluruh teknisi di sistem HVAS.
        </p>
      </div>
      <button
        @click="fetchLogs"
        :disabled="isLoading"
        class="bg-emerald-50 border border-emerald-500 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
      >
        <i
          class="fa-solid fa-rotate-right mr-1"
          :class="{ 'animate-spin': isLoading }"
        ></i>
        {{ isLoading ? "Memuat..." : "Perbarui Data" }}
      </button>
    </header>

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr>
              <th
                class="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200"
              >
                Waktu
              </th>
              <th
                class="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200"
              >
                Pengguna
              </th>
              <th
                class="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200"
              >
                Tindakan
              </th>
              <th
                class="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 text-right"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(log, index) in riwayatAktivitas"
              :key="index"
              class="hover:bg-slate-50/50 transition-colors"
            >
              <td class="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                {{ formatWaktu(log.timestamp) }}
              </td>
              <td class="px-6 py-4">
                <p class="font-bold text-slate-800">{{ log.username }}</p>
                <p class="text-xs text-slate-400 uppercase tracking-wider">
                  {{ log.role }}
                </p>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 font-medium">
                {{ log.action }}
              </td>
              <td class="px-6 py-4 text-right">
                <span
                  :class="
                    log.status === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-rose-100 text-rose-700 border-rose-200'
                  "
                  class="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border"
                >
                  {{ log.status }}
                </span>
              </td>
            </tr>

            <tr v-if="riwayatAktivitas.length === 0">
              <td
                colspan="4"
                class="px-6 py-12 text-center text-slate-400 text-sm font-medium"
              >
                <span v-if="isLoading">Mengambil data dari server...</span>
                <span v-else>Belum ada aktivitas tercatat.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const riwayatAktivitas = ref([]);
const isLoading = ref(false); // Tambahan state untuk indikator loading

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/telemetry/logs");
    riwayatAktivitas.value = response.data;
  } catch (error) {
    console.error(
      "Gagal mengambil data riwayat aktivitas:",
      error.response?.data?.message || error.message,
    );
    // Hapus data dummy, cukup pastikan array kosong jika terjadi error
    riwayatAktivitas.value = [];
  } finally {
    isLoading.value = false;
  }
};

const formatWaktu = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return (
    date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
    " WIB, " +
    date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
  );
};

onMounted(() => {
  fetchLogs();
});
</script>
