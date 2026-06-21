<template>
  <div class="space-y-6 pb-6">
    <section
      class="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Motor HVAS
        </h2>
        <div
          class="px-3 py-1 rounded-full text-xs font-bold tracking-widest transition-colors duration-300"
          :class="
            sensorData.status_pompa === 'ON'
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-slate-100 text-slate-400'
          "
        >
          {{ sensorData.status_pompa || "OFF" }}
        </div>
      </div>

      <div class="flex bg-slate-100 p-1 rounded-2xl mb-6">
        <button
          @click="modeKendali = 'manual'"
          :class="
            modeKendali === 'manual'
              ? 'bg-white shadow-sm text-emerald-600 font-bold'
              : 'text-slate-500 font-medium'
          "
          class="flex-1 py-2 text-sm rounded-xl transition-all"
        >
          Manual
        </button>
        <button
          @click="modeKendali = 'timer'"
          :class="
            modeKendali === 'timer'
              ? 'bg-white shadow-sm text-emerald-600 font-bold'
              : 'text-slate-500 font-medium'
          "
          class="flex-1 py-2 text-sm rounded-xl transition-all"
        >
          Auto
        </button>
      </div>

      <div
        v-if="modeKendali === 'manual'"
        class="flex flex-col items-center py-4"
      >
        <div
          v-if="sensorData.mode !== 'MANUAL'"
          class="mb-6 w-full bg-orange-50 text-orange-600 text-xs font-bold p-3 rounded-xl text-center border border-orange-100"
        >
          <i class="fa-solid fa-triangle-exclamation mr-1"></i>
          Mode Otomatis sedang berjalan. Matikan siklus terlebih dahulu untuk
          kendali manual.
        </div>

        <button
          @click="
            kirimPerintahPompa(sensorData.status_pompa === 'ON' ? 'OFF' : 'ON')
          "
          :disabled="isSending || sensorData.mode !== 'MANUAL'"
          class="w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 shadow-lg border-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="
            sensorData.status_pompa === 'ON'
              ? 'bg-emerald-500 border-emerald-200 shadow-emerald-500/40 text-white'
              : 'bg-slate-100 border-white text-slate-400 hover:bg-slate-200'
          "
        >
          <i class="fa-solid fa-power-off text-3xl mb-1"></i>
          <span class="font-bold tracking-wider">{{
            sensorData.status_pompa === "ON" ? "MATIKAN" : "NYALAKAN"
          }}</span>
        </button>
      </div>

      <div v-else class="space-y-4">
        <div v-if="sensorData.mode === 'MANUAL'" class="space-y-4">
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-400 mb-1 ml-1"
                >Lama Hidup (ON)</label
              >
              <div class="relative">
                <input
                  type="number"
                  v-model="inputDurasiOn"
                  class="w-full bg-slate-50 border-none rounded-xl pl-4 pr-12 py-3 text-emerald-700 font-black outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                />
                <span
                  class="absolute right-4 top-3.5 text-xs font-bold text-slate-400"
                  >Menit</span
                >
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-400 mb-1 ml-1"
                >Lama Mati (OFF)</label
              >
              <div class="relative">
                <input
                  type="number"
                  v-model="inputDurasiOff"
                  class="w-full bg-slate-50 border-none rounded-xl pl-4 pr-12 py-3 text-slate-700 font-black outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                />
                <span
                  class="absolute right-4 top-3.5 text-xs font-bold text-slate-400"
                  >Menit</span
                >
              </div>
            </div>
          </div>
          <button
            @click="kirimJadwalSiklus"
            :disabled="isSending"
            class="w-full py-3.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            <i class="fa-solid fa-rotate mr-2"></i> Aktifkan
          </button>
        </div>

        <div
          v-else
          class="mt-4 p-6 rounded-2xl border-2 transition-colors duration-500"
          :class="
            sensorData.cycle_phase === 'ON'
              ? 'bg-emerald-50 border-emerald-400'
              : 'bg-orange-50 border-orange-400'
          "
        >
          <div class="flex justify-between items-center mb-2">
            <span
              class="text-xs font-black uppercase tracking-wider"
              :class="
                sensorData.cycle_phase === 'ON'
                  ? 'text-emerald-600'
                  : 'text-orange-600'
              "
            >
              Fase
              {{ sensorData.cycle_phase === "ON" ? "Menyala" : "Istirahat" }}
            </span>
            <span class="flex h-3 w-3 relative">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                :class="
                  sensorData.cycle_phase === 'ON'
                    ? 'bg-emerald-400'
                    : 'bg-orange-400'
                "
              ></span>
              <span
                class="relative inline-flex rounded-full h-3 w-3"
                :class="
                  sensorData.cycle_phase === 'ON'
                    ? 'bg-emerald-500'
                    : 'bg-orange-500'
                "
              ></span>
            </span>
          </div>

          <p
            class="text-3xl font-black font-mono text-center my-6 tracking-tight"
            :class="
              sensorData.cycle_phase === 'ON'
                ? 'text-emerald-700'
                : 'text-orange-700'
            "
          >
            {{ sisaWaktuVisual }}
          </p>

          <button
            @click="hentikanSiklus"
            :disabled="isSending"
            class="w-full py-3 bg-white text-rose-600 font-bold rounded-xl border border-rose-200 hover:bg-rose-50 active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            Matikan
          </button>
        </div>
      </div>
    </section>

    <section
      class="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
    >
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2
            class="text-sm font-bold text-slate-400 uppercase tracking-widest"
          >
            Kipas Panel
          </h2>
        </div>
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
          :class="
            sensorData.status_kipas === 'ON'
              ? 'bg-sky-100 text-sky-500'
              : 'bg-slate-100 text-slate-400'
          "
        >
          <i
            class="fa-solid fa-fan"
            :class="{ 'animate-spin': sensorData.status_kipas === 'ON' }"
          ></i>
        </div>
      </div>

      <div
        class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between"
      >
        <div>
          <span class="block text-xs font-bold text-slate-700 mb-1"
            >Mode Auto</span
          >
        </div>

        <button
          @click="toggleModeKipas"
          :disabled="isSending"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50"
          :class="
            sensorData.mode_kipas === 'AUTO' ? 'bg-emerald-500' : 'bg-slate-300'
          "
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="
              sensorData.mode_kipas === 'AUTO'
                ? 'translate-x-6'
                : 'translate-x-1'
            "
          ></span>
        </button>
      </div>

      <div v-if="sensorData.mode_kipas !== 'AUTO'" class="mt-4 flex gap-2">
        <button
          @click="kirimPerintahKipas('ON')"
          :disabled="isSending || sensorData.status_kipas === 'ON'"
          class="flex-1 py-2 text-xs font-bold rounded-xl transition-all border"
          :class="
            sensorData.status_kipas === 'ON'
              ? 'bg-sky-50 text-sky-600 border-sky-200 shadow-inner'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          "
        >
          Nyalakan
        </button>
        <button
          @click="kirimPerintahKipas('OFF')"
          :disabled="isSending || sensorData.status_kipas === 'OFF'"
          class="flex-1 py-2 text-xs font-bold rounded-xl transition-all border"
          :class="
            sensorData.status_kipas === 'OFF'
              ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-inner'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          "
        >
          Matikan
        </button>
      </div>
    </section>

    <section>
      <h2
        class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2"
      >
        Monitor Udara
      </h2>
      <div class="grid grid-cols-2 gap-4">
        <div
          class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden"
        >
          <div class="flex justify-between items-start mb-3">
            <div
              class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-500"
            >
              <i class="fa-solid fa-microchip"></i>
            </div>
            <span
              class="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md border"
              :class="infoSuhuESP.colorClass"
            >
              {{ infoSuhuESP.label }}
            </span>
          </div>
          <span class="text-xs text-slate-400 font-medium">Suhu ESP</span>
          <div class="text-2xl font-black text-slate-800">
            {{
              sensorData.suhu_esp
                ? parseFloat(sensorData.suhu_esp).toFixed(1)
                : "-"
            }}<span class="text-sm text-slate-400 font-normal">°C</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div
            class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 mb-3"
          >
            <i class="fa-solid fa-wind"></i>
          </div>
          <span class="text-xs text-slate-400 font-medium">Tekanan Udara</span>
          <div class="text-2xl font-black text-slate-800">
            {{ sensorData.tekanan
            }}<span class="text-sm text-slate-400 font-normal">hPa</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div
            class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mb-3"
          >
            <i class="fa-solid fa-temperature-half"></i>
          </div>
          <span class="text-xs text-slate-400 font-medium">Suhu Dalam</span>
          <div class="text-2xl font-black text-slate-800">
            {{ sensorData.suhu_bme
            }}<span class="text-sm text-slate-400 font-normal">°C</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div
            class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-500 mb-3"
          >
            <i class="fa-solid fa-droplet"></i>
          </div>
          <span class="text-xs text-slate-400 font-medium">Lembab Dalam</span>
          <div class="text-2xl font-black text-slate-800">
            {{ sensorData.kelembaban_bme
            }}<span class="text-sm text-slate-400 font-normal">%</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div
            class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-3"
          >
            <i class="fa-solid fa-temperature-arrow-up"></i>
          </div>
          <span class="text-xs text-slate-400 font-medium">Suhu Luar</span>
          <div class="text-2xl font-black text-slate-800">
            {{ sensorData.suhu_dht
            }}<span class="text-sm text-slate-400 font-normal">°C</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div
            class="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500 mb-3"
          >
            <i class="fa-solid fa-cloud-rain"></i>
          </div>
          <span class="text-xs text-slate-400 font-medium">Lembab Luar</span>
          <div class="text-2xl font-black text-slate-800">
            {{ sensorData.kelembaban_dht
            }}<span class="text-sm text-slate-400 font-normal">%</span>
          </div>
        </div>

        <div
          class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 col-span-2"
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <i class="fa-solid fa-wave-square"></i>
              </div>
              <span class="text-xs text-slate-400 font-medium"
                >Kebisingan Ruang</span
              >
            </div>
            <div class="text-2xl font-black text-slate-800">
              {{ sensorData.kebisingan
              }}<span class="text-sm text-slate-400 font-normal ml-1">dB</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import api from "../services/api";
import { sensorData } from "../services/ws";

if (sensorData.value.status_kipas === undefined) {
  sensorData.value.status_kipas = "OFF";
  sensorData.value.mode_kipas = "AUTO";
}

const isSending = ref(false);
const modeKendali = ref("manual");

const inputDurasiOn = ref(180);
const inputDurasiOff = ref(60);

const sisaWaktuVisual = computed(() => {
  const totalMenit = sensorData.value.sisa_waktu || 0;
  if (totalMenit <= 0) return "Memuat data...";

  const h = Math.floor(totalMenit / 60)
    .toString()
    .padStart(2, "0");
  const m = Math.floor(totalMenit % 60)
    .toString()
    .padStart(2, "0");

  if (h === "00") return `${m} Menit`;
  return `${h} Jam ${m} Menit`;
});

// Status Warna Suhu ESP32
const infoSuhuESP = computed(() => {
  const suhu = parseFloat(sensorData.value.suhu_esp) || 0;
  if (suhu === 0)
    return {
      label: "MEMUAT",
      colorClass: "text-slate-400 bg-slate-100 border-slate-200",
    };

  if (suhu > 75) {
    return {
      label: "OVERHEAT!",
      colorClass: "text-rose-600 bg-rose-100 border-rose-200 animate-pulse",
    };
  } else if (suhu > 65) {
    return {
      label: "PANAS",
      colorClass: "text-orange-600 bg-orange-100 border-orange-200",
    };
  } else {
    return {
      label: "NORMAL",
      colorClass: "text-emerald-600 bg-emerald-100 border-emerald-200",
    };
  }
});

const kirimPerintahPompa = async (status) => {
  isSending.value = true;
  try {
    await api.post("/control", { action: status, target: "POMPA" });
  } catch (error) {
    alert(error.response?.data?.message || "Gagal mengirim perintah pompa.");
  } finally {
    isSending.value = false;
  }
};

const hentikanSiklus = async () => {
  if (confirm("Yakin ingin membatalkan siklus otomatis dan mematikan pompa?")) {
    await kirimPerintahPompa("OFF");
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
    await api.post("/control", {
      action: "CYCLE",
      durasi_on: dOn,
      durasi_off: dOff,
    });

    // --- PERBAIKAN: Optimistic Update ---
    // Memberikan respons instan pada UI web sebelum ESP32 membalas
    sensorData.value.sisa_waktu = dOn;
    // ------------------------------------

    sensorData.value.mode = "CYCLE";
    sensorData.value.cycle_phase = "ON";
  } catch (error) {
    alert(error.response?.data?.message || "Gagal mengaktifkan siklus.");
  } finally {
    isSending.value = false;
  }
};

const toggleModeKipas = async () => {
  isSending.value = true;
  const newMode = sensorData.value.mode_kipas === "AUTO" ? "MANUAL" : "AUTO";
  try {
    await api.post("/control", { action: "SET_MODE_KIPAS", mode: newMode });
    sensorData.value.mode_kipas = newMode;
  } catch (error) {
    alert("Gagal merubah mode kipas.");
  } finally {
    isSending.value = false;
  }
};

const kirimPerintahKipas = async (status) => {
  isSending.value = true;
  try {
    await api.post("/control", { action: status, target: "KIPAS" });
  } catch (error) {
    alert("Gagal mengontrol kipas.");
  } finally {
    isSending.value = false;
  }
};
</script>
