<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
        Pemantauan Real-Time
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Grafik dan metrik sensor HVAS Lab Udara BSPJI Padang.
      </p>
    </header>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        class="bg-emerald-50 border border-emerald-500 p-5 rounded-2xl shadow-sm"
      >
        <p class="text-emerald-700 font-bold text-xs mb-1">Status Gateway</p>
        <h3
          class="text-lg font-black"
          :class="isConnected ? 'text-emerald-900' : 'text-rose-600'"
        >
          {{ isConnected ? "ONLINE" : "OFFLINE" }}
        </h3>
      </div>
      <div
        class="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col items-center"
      >
        <span
          class="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2"
          >Tekanan</span
        >

        <div class="relative w-32 h-32 flex items-center justify-center">
          <svg class="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              stroke-width="8"
              fill="transparent"
              class="text-slate-100"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              stroke-width="8"
              fill="transparent"
              stroke-dasharray="352"
              :stroke-dashoffset="getDashOffset(sensorData.tekanan)"
              stroke-linecap="round"
              class="transition-all duration-1000 ease-out"
              :class="getTekananColor(sensorData.tekanan)"
            />
          </svg>
          <div class="absolute flex flex-col items-center">
            <span class="text-xl font-black text-slate-800">{{
              sensorData.tekanan || 0
            }}</span>
            <span class="text-[10px] text-slate-400 font-bold">hPa</span>
          </div>
        </div>
      </div>
      <div
        class="bg-emerald-50 border border-emerald-500 p-5 rounded-2xl shadow-sm"
      >
        <p class="text-emerald-700 font-bold text-xs mb-1">Kebisingan</p>
        <h3 class="text-lg font-black text-emerald-900">
          {{ sensorData.kebisingan || 0 }}
          <span class="text-sm font-medium">dB</span>
        </h3>
      </div>
      <div
        class="bg-emerald-50 border border-emerald-500 p-5 rounded-2xl shadow-sm"
      >
        <p class="text-emerald-700 font-bold text-xs mb-1">Motor HVAS</p>
        <h3 class="text-lg font-black text-emerald-900">
          {{ sensorData.status_pompa || "OFF" }}
        </h3>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-slate-800">Tren Suhu (°C)</h2>
        </div>
        <VueApexCharts
          type="area"
          height="300"
          :options="suhuOptions"
          :series="suhuSeries"
        />
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-slate-800">Tren Kelembapan (%)</h2>
        </div>
        <VueApexCharts
          type="area"
          height="300"
          :options="lembabOptions"
          :series="lembabSeries"
        />
      </div>
    </div>
  </div>
</template>

<script setup>

const getDashOffset = (tekanan) => {
  const min = 980;
  const max = 1050;
  const percentage = Math.min(Math.max((tekanan - min) / (max - min), 0), 1);
  return 352 - percentage * 352;
};

const getTekananColor = (tekanan) => {
  if (!tekanan) return "text-slate-300";
  if (tekanan < 1000) return "text-amber-500";
  if (tekanan >= 1000 && tekanan <= 1020) return "text-emerald-500";
  return "text-blue-500";
};

import { ref, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";
import api from "../services/api";
import { initWebSocket, isConnected, sensorData } from "../services/ws";

const suhuSeries = ref([
  { name: "Suhu Dalam", data: [] },
  { name: "Suhu Luar", data: [] },
]);

const lembabSeries = ref([
  { name: "Lembab Dalam", data: [] },
  { name: "Lembab Luar", data: [] },
]);

const chartCategories = ref([]);

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
      {
        name: "Lembab Dalam",
        data: data.map((item) => item.kelembaban_bme),
      },
      {
        name: "Lembab Luar",
        data: data.map((item) => item.kelembaban_dht),
      },
    ];
  } catch (error) {
    console.error(
      "Gagal mengambil data grafik historis, menggunakan data dummy:",
      error,
    );

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
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100],
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

onMounted(() => {
  initWebSocket();
  fetchChartData();
});
</script>
