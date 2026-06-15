<template>
  <div class="space-y-6">
    <section class="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Motor HVAS</h2>
        <div
          class="px-3 py-1 rounded-full text-xs font-bold tracking-widest transition-colors duration-300"
          :class="sensorData.status_pompa === 'ON' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'"
        >
          {{ sensorData.status_pompa || 'OFF' }}
        </div>
      </div>

      <div class="flex bg-slate-100 p-1 rounded-2xl mb-6">
        <button @click="modeKendali = 'manual'" :class="modeKendali === 'manual' ? 'bg-white shadow-sm text-emerald-600 font-bold' : 'text-slate-500 font-medium'" class="flex-1 py-2 text-sm rounded-xl transition-all">Manual</button>
        <button @click="modeKendali = 'timer'" :class="modeKendali === 'timer' ? 'bg-white shadow-sm text-emerald-600 font-bold' : 'text-slate-500 font-medium'" class="flex-1 py-2 text-sm rounded-xl transition-all">Siklus Waktu</button>
      </div>

      <div v-if="modeKendali === 'manual'" class="flex justify-center py-4">
        <button
          @click="kirimPerintah(sensorData.status_pompa === 'ON' ? 'OFF' : 'ON')"
          :disabled="isSending"
          class="w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 shadow-lg border-4 active:scale-95 disabled:opacity-50"
          :class="sensorData.status_pompa === 'ON' ? 'bg-emerald-500 border-emerald-200 shadow-emerald-500/40 text-white' : 'bg-slate-100 border-white text-slate-400'"
        >
          <i class="fa-solid fa-power-off text-3xl mb-1"></i>
          <span class="font-bold tracking-wider">{{ sensorData.status_pompa === "ON" ? "MATIKAN" : "NYALAKAN" }}</span>
        </button>
      </div>

      <div v-else class="space-y-4">
        <div v-if="!sisaWaktuVisual" class="space-y-4">
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-400 mb-1 ml-1">Lama Hidup (ON)</label>
              <input type="number" v-model="inputDurasiOn" placeholder="Menit" class="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-800 font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-center" />
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-400 mb-1 ml-1">Lama Mati (OFF)</label>
              <input type="number" v-model="inputDurasiOff" placeholder="Menit" class="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-800 font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-center" />
            </div>
          </div>
          <button @click="kirimJadwalSiklus" :disabled="isSending" class="w-full py-3.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md">
            Jalankan Siklus Otomatis
          </button>
        </div>

        <div v-else class="mt-4 p-6 rounded-2xl border-2 transition-colors duration-500" :class="cyclePhase === 'ON' ? 'bg-emerald-50 border-emerald-400' : 'bg-orange-50 border-orange-400'">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-black uppercase tracking-wider" :class="cyclePhase === 'ON' ? 'text-emerald-600' : 'text-orange-600'">Fase {{ cyclePhase === "ON" ? "Menyala" : "Istirahat" }}</span>
            <span class="flex h-3 w-3 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="cyclePhase === 'ON' ? 'bg-emerald-400' : 'bg-orange-400'"></span>
              <span class="relative inline-flex rounded-full h-3 w-3" :class="cyclePhase === 'ON' ? 'bg-emerald-500' : 'bg-orange-500'"></span>
            </span>
          </div>
          <p class="text-5xl font-black font-mono text-center my-6 tracking-tight" :class="cyclePhase === 'ON' ? 'text-emerald-700' : 'text-orange-700'">{{ sisaWaktuVisual }}</p>
          <button @click="hentikanSiklus" :disabled="isSending" class="w-full py-3 bg-white text-rose-600 font-bold rounded-xl border border-rose-200 hover:bg-rose-50 active:scale-95 transition-all shadow-sm">
            Batalkan & Matikan
          </button>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Monitor Udara</h2>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mb-3"><i class="fa-solid fa-temperature-half"></i></div>
          <span class="text-xs text-slate-400 font-medium">Suhu Dalam</span>
          <div class="text-2xl font-black text-slate-800">{{ sensorData.suhu_bme }}<span class="text-sm text-slate-400 font-normal">°C</span></div>
        </div>
        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-500 mb-3"><i class="fa-solid fa-droplet"></i></div>
          <span class="text-xs text-slate-400 font-medium">Lembab Dalam</span>
          <div class="text-2xl font-black text-slate-800">{{ sensorData.kelembaban_bme }}<span class="text-sm text-slate-400 font-normal">%</span></div>
        </div>
        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-3"><i class="fa-solid fa-temperature-arrow-up"></i></div>
          <span class="text-xs text-slate-400 font-medium">Suhu Luar</span>
          <div class="text-2xl font-black text-slate-800">{{ sensorData.suhu_dht }}<span class="text-sm text-slate-400 font-normal">°C</span></div>
        </div>
        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div class="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500 mb-3"><i class="fa-solid fa-cloud-rain"></i></div>
          <span class="text-xs text-slate-400 font-medium">Lembab Luar</span>
          <div class="text-2xl font-black text-slate-800">{{ sensorData.kelembaban_dht }}<span class="text-sm text-slate-400 font-normal">%</span></div>
        </div>
        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 mb-3"><i class="fa-solid fa-wind"></i></div>
          <span class="text-xs text-slate-400 font-medium">Tekanan Udara</span>
          <div class="text-2xl font-black text-slate-800">{{ sensorData.tekanan }}<span class="text-sm text-slate-400 font-normal">hPa</span></div>
        </div>
        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3"><i class="fa-solid fa-wave-square"></i></div>
          <span class="text-xs text-slate-400 font-medium">Kebisingan</span>
          <div class="text-2xl font-black text-slate-800">{{ sensorData.kebisingan }}<span class="text-sm text-slate-400 font-normal">dB</span></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import api from "../services/api";
import { sensorData, timerEndTime, cyclePhase } from "../services/ws";

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
    const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
    sisaWaktuVisual.value = h === "00" ? `${m}:${s}` : `${h}:${m}:${s}`;
  }
};

onMounted(() => {
  intervalHitungMundur = setInterval(updateHitungMundur, 1000);
});

onUnmounted(() => {
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

const hentikanSiklus = async () => {
  if (confirm("Yakin ingin membatalkan siklus dan mematikan pompa?")) {
    await kirimPerintah("OFF");
  }
};

const kirimJadwalSiklus = async () => {
  const dOn = parseInt(inputDurasiOn.value);
  const dOff = parseInt(inputDurasiOff.value);
  if (!dOn || !dOff || dOn <= 0 || dOff <= 0) {
    alert("Harap masukkan durasi yang valid!");
    return;
  }
  isSending.value = true;
  try {
    await api.post("/control", { action: "CYCLE", durasi_on: dOn, durasi_off: dOff });
  } catch (error) {
    alert(error.response?.data?.message || "Gagal mengaktifkan siklus.");
  } finally {
    isSending.value = false;
  }
};
</script>