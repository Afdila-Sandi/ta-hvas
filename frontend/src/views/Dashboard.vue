<template>
  <div class="min-h-screen bg-slate-50 font-sans pb-8">
    <header
      class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm flex justify-between items-center"
    >
      <div>
        <h1 class="text-lg font-bold text-slate-800 leading-tight">
          HVAS BSPJI Padang
        </h1>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="relative flex h-2.5 w-2.5">
            <span
              v-if="isConnected"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2.5 w-2.5"
              :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
            ></span>
          </span>
          <span
            class="text-xs font-medium"
            :class="isConnected ? 'text-green-600' : 'text-red-500'"
          >
            {{ isConnected ? "Sistem Online" : "Terputus..." }}
          </span>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          @click="router.push('/riwayat')"
          class="p-2 bg-blue-50 text-blue-600 rounded-full active:bg-blue-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          @click="handleLogout"
          class="p-2 bg-slate-100 text-slate-600 rounded-full active:bg-slate-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </header>

    <main class="p-4 max-w-lg md:max-w-4xl mx-auto space-y-5 mt-2">
      <section
        class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Kendali Pompa
          </h2>
          <div
            class="px-3 py-1 rounded-full text-sm font-black tracking-widest transition-colors duration-500"
            :class="
              sensorData.status_pompa === 'ON'
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-500'
            "
          >
            {{ sensorData.status_pompa }}
          </div>
        </div>

        <div class="flex bg-slate-100 p-1 rounded-lg mb-4">
          <button
            @click="modeKendali = 'manual'"
            :class="
              modeKendali === 'manual'
                ? 'bg-white shadow-sm text-blue-600 font-bold'
                : 'text-slate-500 font-medium'
            "
            class="flex-1 py-1.5 text-sm rounded-md transition-all"
          >
            Manual
          </button>
          <button
            @click="modeKendali = 'timer'"
            :class="
              modeKendali === 'timer'
                ? 'bg-white shadow-sm text-blue-600 font-bold'
                : 'text-slate-500 font-medium'
            "
            class="flex-1 py-1.5 text-sm rounded-md transition-all"
          >
            Timer Siklus
          </button>
        </div>

        <div v-if="modeKendali === 'manual'" class="grid grid-cols-2 gap-3">
          <button
            @click="kirimPerintah('ON')"
            :disabled="isSending"
            class="py-3 bg-gradient-to-br from-green-400 to-green-600 active:from-green-500 active:to-green-700 text-white font-bold rounded-xl shadow-sm transition-all flex flex-col items-center gap-1"
          >
            <span class="text-xs">NYALAKAN</span>
          </button>
          <button
            @click="kirimPerintah('OFF')"
            :disabled="isSending"
            class="py-3 bg-gradient-to-br from-red-400 to-red-600 active:from-red-500 active:to-red-700 text-white font-bold rounded-xl shadow-sm transition-all flex flex-col items-center gap-1"
          >
            <span class="text-xs">MATIKAN</span>
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3"
          >
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="block text-xs font-bold text-slate-500 mb-1"
                  >Durasi Hidup (Menit)</label
                >
                <input
                  type="number"
                  v-model="inputDurasiOn"
                  min="1"
                  placeholder="Misal: 180"
                  class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold outline-none focus:border-blue-500"
                />
              </div>
              <div class="flex-1">
                <label class="block text-xs font-bold text-slate-500 mb-1"
                  >Durasi Mati (Menit)</label
                >
                <input
                  type="number"
                  v-model="inputDurasiOff"
                  min="1"
                  placeholder="Misal: 60"
                  class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              @click="kirimJadwalSiklus"
              :disabled="isSending"
              class="mt-2 w-full py-3 bg-slate-800 active:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition-all flex justify-center items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path d="M12 8v4l3 3"></path>
              </svg>
              AKTIFKAN SIKLUS
            </button>
          </div>

          <div
            class="p-4 rounded-xl border flex flex-col justify-center items-center text-center h-full min-h-[140px] transition-colors duration-500"
            :class="
              cyclePhase === 'ON'
                ? 'bg-blue-50/80 border-blue-200'
                : cyclePhase === 'OFF'
                  ? 'bg-orange-50/80 border-orange-200'
                  : 'bg-slate-50 border-slate-200'
            "
          >
            <template v-if="sisaWaktuVisual">
              <span
                class="text-xs font-bold uppercase tracking-widest mb-1"
                :class="
                  cyclePhase === 'ON' ? 'text-blue-500' : 'text-orange-500'
                "
              >
                Sisa Waktu {{ cyclePhase === "ON" ? "Menyala" : "Istirahat" }}
              </span>

              <span
                class="text-5xl font-black font-mono tracking-tight my-1"
                :class="
                  cyclePhase === 'ON' ? 'text-blue-700' : 'text-orange-700'
                "
              >
                {{ sisaWaktuVisual }}
              </span>

              <span
                class="text-xs font-semibold px-3 py-1 rounded-full mt-2 animate-pulse"
                :class="
                  cyclePhase === 'ON'
                    ? 'bg-blue-200 text-blue-700'
                    : 'bg-orange-200 text-orange-700'
                "
              >
                Fase Pompa:
                {{ cyclePhase === "ON" ? "HIDUP" : "MATI SEMENTARA" }}
              </span>
            </template>

            <template v-else>
              <div class="flex flex-col items-center opacity-40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-10 w-10 mb-2 text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  <path d="M12 7v5l3 3"></path>
                </svg>
                <span class="text-sm font-bold text-slate-500"
                  >Tidak ada siklus aktif</span
                >
              </div>
            </template>
          </div>
        </div>
      </section>

      <section>
        <h2
          class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1"
        >
          Metrik Real-Time
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div
            class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col"
          >
            <span class="text-xs text-slate-500 font-medium mb-1"
              >Suhu Dalam</span
            >
            <div class="text-2xl font-bold text-slate-800 mt-auto">
              {{ sensorData.suhu_bme }}
              <span class="text-sm text-slate-400 font-normal">°C</span>
            </div>
          </div>
          <div
            class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col"
          >
            <span class="text-xs text-slate-500 font-medium mb-1"
              >Lembab Dalam</span
            >
            <div class="text-2xl font-bold text-slate-800 mt-auto">
              {{ sensorData.kelembaban_bme }}
              <span class="text-sm text-slate-400 font-normal">%</span>
            </div>
          </div>
          <div
            class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col"
          >
            <span class="text-xs text-slate-500 font-medium mb-1"
              >Tekanan Udara</span
            >
            <div class="text-2xl font-bold text-slate-800 mt-auto">
              {{ sensorData.tekanan }}
              <span class="text-sm text-slate-400 font-normal">hPa</span>
            </div>
          </div>
          <div
            class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col"
          >
            <span class="text-xs text-slate-500 font-medium mb-1"
              >Suhu Luar</span
            >
            <div class="text-2xl font-bold text-slate-800 mt-auto">
              {{ sensorData.suhu_dht }}
              <span class="text-sm text-slate-400 font-normal">°C</span>
            </div>
          </div>
          <div
            class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col"
          >
            <span class="text-xs text-slate-500 font-medium mb-1"
              >Lembab Luar</span
            >
            <div class="text-2xl font-bold text-slate-800 mt-auto">
              {{ sensorData.kelembaban_dht }}
              <span class="text-sm text-slate-400 font-normal">%</span>
            </div>
          </div>
          <div
            class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col"
          >
            <span class="text-xs text-slate-500 font-medium mb-1"
              >Kebisingan</span
            >
            <div class="text-2xl font-bold text-slate-800 mt-auto">
              {{ sensorData.kebisingan }}
              <span class="text-sm text-slate-400 font-normal">dB</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../services/api";
import {
  initWebSocket,
  closeWebSocket,
  isConnected,
  sensorData,
  timerEndTime,
  cyclePhase,
} from "../services/ws";

const router = useRouter();
const authStore = useAuthStore();
const isSending = ref(false);

const modeKendali = ref("manual");
const inputDurasiOn = ref("");
const inputDurasiOff = ref("");
const sisaWaktuVisual = ref("");
let intervalHitungMundur;

const updateHitungMundur = () => {
  if (!timerEndTime.value) {
    sisaWaktuVisual.value = "";
    return;
  }

  const diff = new Date(timerEndTime.value).getTime() - Date.now();

  if (diff <= 0) {
    sisaWaktuVisual.value = "00:00";
  } else {
    const h = Math.floor(diff / 3600000)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((diff % 3600000) / 60000)
      .toString()
      .padStart(2, "0");
    const s = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");

    sisaWaktuVisual.value = h === "00" ? `${m}:${s}` : `${h}:${m}:${s}`;
  }
};

onMounted(() => {
  initWebSocket();
  intervalHitungMundur = setInterval(updateHitungMundur, 1000);
});

onUnmounted(() => {
  closeWebSocket();
  clearInterval(intervalHitungMundur);
});

const kirimPerintah = async (status) => {
  isSending.value = true;
  try {
    await api.post("/control", { action: status });
  } catch (error) {
    alert(error.response?.data?.message || "Gagal mengirim perintah.");
  } finally {
    isSending.value = false;
  }
};

const kirimJadwalSiklus = async () => {
  const dOn = parseInt(inputDurasiOn.value);
  const dOff = parseInt(inputDurasiOff.value);

  if (!dOn || !dOff || dOn <= 0 || dOff <= 0) {
    alert("Harap masukkan Durasi Hidup dan Mati yang valid (minimal 1 menit)!");
    return;
  }

  isSending.value = true;
  try {
    await api.post("/control", {
      action: "CYCLE",
      durasi_on: dOn,
      durasi_off: dOff,
    });

    inputDurasiOn.value = "";
    inputDurasiOff.value = "";
  } catch (error) {
    alert(error.response?.data?.message || "Gagal mengaktifkan siklus.");
  } finally {
    isSending.value = false;
  }
};

const handleLogout = () => {
  authStore.logout();
  closeWebSocket();
  router.push("/login");
};
</script>
