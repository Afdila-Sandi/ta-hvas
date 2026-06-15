<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center mb-2 px-1">
      <h2 class="text-sm font-bold text-slate-800 uppercase tracking-widest">Aktivitas Terbaru</h2>
      <button @click="fetchLogs" class="text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
        <i class="fa-solid fa-rotate-right mr-1" :class="{'animate-spin': isLoading}"></i> Refresh
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10 text-slate-400 text-sm">
      Memuat riwayat...
    </div>

    <div v-else-if="riwayatAktivitas.length === 0" class="text-center py-10 text-slate-400 text-sm">
      Belum ada aktivitas tercatat.
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="(log, index) in riwayatAktivitas" 
        :key="index"
        class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start"
      >
        <div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold"
             :class="log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'">
          <i class="fa-solid" :class="log.status === 'SUCCESS' ? 'fa-check' : 'fa-xmark'"></i>
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-start mb-1">
            <h3 class="text-sm font-bold text-slate-800">{{ log.action }}</h3>
            <span class="text-[10px] text-slate-400 whitespace-nowrap ml-2">{{ formatWaktuPintas(log.timestamp) }}</span>
          </div>
          <p class="text-xs text-slate-500">Oleh: <span class="font-bold text-slate-700">{{ log.username }}</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const riwayatAktivitas = ref([]);
const isLoading = ref(false);

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/telemetry/logs");
    riwayatAktivitas.value = response.data;
  } catch (error) {
    console.error("Gagal mengambil data logs:", error);
    riwayatAktivitas.value = [];
  } finally {
    isLoading.value = false;
  }
};

const formatWaktuPintas = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
};

onMounted(() => {
  fetchLogs();
});
</script>