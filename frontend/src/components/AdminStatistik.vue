<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
        Pemantauan Real-Time
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Metrik sensor HVAS Laboratorium Udara secara langsung.
      </p>
    </header>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
      >
        <span
          class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2"
          >Koneksi Sistem</span
        >
        <div class="flex items-center gap-2">
          <span class="relative flex h-3 w-3">
            <span
              v-if="isConnected"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-3 w-3"
              :class="isConnected ? 'bg-emerald-500' : 'bg-rose-500'"
            ></span>
          </span>
          <span
            class="text-2xl font-black"
            :class="isConnected ? 'text-slate-800' : 'text-rose-600'"
          >
            {{ isConnected ? "ONLINE" : "OFFLINE" }}
          </span>
        </div>
      </div>

      <div
        class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
      >
        <span
          class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2"
          >Motor HVAS</span
        >
        <span
          class="text-2xl font-black"
          :class="
            sensorData.status_pompa === 'ON'
              ? 'text-emerald-600'
              : 'text-slate-800'
          "
        >
          {{ sensorData.status_pompa || "OFF" }}
        </span>
      </div>

      <div
        class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
      >
        <span
          class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2"
          >Tekanan Udara</span
        >
        <div class="text-2xl font-black text-slate-800">
          {{ sensorData.tekanan || 0 }}
          <span class="text-sm font-medium text-slate-400">hPa</span>
        </div>
      </div>

      <div
        class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
      >
        <span
          class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2"
          >Kebisingan</span
        >
        <div class="text-2xl font-black text-slate-800">
          {{ sensorData.kebisingan || 0 }}
          <span class="text-sm font-medium text-slate-400">dB</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 class="text-sm font-bold text-slate-800 mb-4">Tren Suhu (°C)</h2>
        <VueApexCharts
          type="area"
          height="280"
          :options="suhuOptions"
          :series="suhuSeries"
        />
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 class="text-sm font-bold text-slate-800 mb-4">
          Tren Kelembapan (%)
        </h2>
        <VueApexCharts
          type="area"
          height="280"
          :options="lembabOptions"
          :series="lembabSeries"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. Imports diurutkan dengan rapi di paling atas
import { ref, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";
import api from "../services/api";
import { initWebSocket, isConnected, sensorData } from "../services/ws";

// 2. Data Grafik
const chartCategories = ref([]);
const suhuSeries = ref([
  { name: "Suhu Dalam", data: [] },
  { name: "Suhu Luar", data: [] },
]);
const lembabSeries = ref([
  { name: "Lembab Dalam", data: [] },
  { name: "Lembab Luar", data: [] },
]);

// 3. Konfigurasi Grafik Global (Disederhanakan)
const getChartOptions = (colors) => ({
  chart: {
    type: "area",
    fontFamily: "inherit",
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: colors,
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0.05,
      stops: [0, 100],
    },
  },
  xaxis: {
    categories: chartCategories.value,
    labels: { style: { colors: "#94a3b8" } },
  },
  yaxis: { labels: { style: { colors: "#94a3b8" } } },
  grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
  legend: { position: "top", horizontalAlign: "right" },
});

const suhuOptions = ref(getChartOptions(["#059669", "#f59e0b"]));
const lembabOptions = ref(getChartOptions(["#38bdf8", "#8b5cf6"]));

// 4. Fetch Data Historis
const fetchChartData = async () => {
  try {
    const response = await api.get("/telemetry/history");
    const data = response.data;

    chartCategories.value = data.map((item) => item.waktu || item.jam);
    suhuSeries.value = [
      { name: "Suhu Dalam", data: data.map((item) => item.suhu_bme) },
      { name: "Suhu Luar", data: data.map((item) => item.suhu_dht) },
    ];
    lembabSeries.value = [
      { name: "Lembab Dalam", data: data.map((item) => item.kelembaban_bme) },
      { name: "Lembab Luar", data: data.map((item) => item.kelembaban_dht) },
    ];
  } catch (error) {
    console.warn("API gagal, menggunakan data dummy.");
    chartCategories.value = [
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
    ];
    suhuSeries.value = [
      { name: "Suhu Dalam", data: [24.1, 24.5, 25.0, 24.8, 24.2, 23.9] },
      { name: "Suhu Luar", data: [28.0, 30.5, 33.2, 32.8, 29.5, 27.0] },
    ];
    lembabSeries.value = [
      { name: "Lembab Dalam", data: [55, 52, 50, 51, 54, 56] },
      { name: "Lembab Luar", data: [70, 65, 60, 62, 68, 72] },
    ];
  }
};

onMounted(() => {
  initWebSocket();
  fetchChartData();
});
</script>
