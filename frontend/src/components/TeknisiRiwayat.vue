<template>
  <div class="space-y-6 pb-6">
    <div class="flex justify-between items-center px-1">
      <div>
        <h2 class="text-sm font-bold text-slate-800 uppercase tracking-widest">
          Grafik Data
        </h2>
      </div>
      <button
        @click="fetchChartData"
        class="text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
      >
        <i
          class="fa-solid fa-rotate-right mr-1"
          :class="{ 'animate-spin': isLoading }"
        ></i>
        Refresh
      </button>
    </div>

    <div
      v-if="isLoading"
      class="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-center"
    >
      <i
        class="fa-solid fa-circle-notch fa-spin text-emerald-500 text-2xl mb-3"
      ></i>
      <p class="text-xs font-bold text-slate-500">Menyusun data grafik...</p>
    </div>

    <div
      v-else-if="chartCategories.length === 0"
      class="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-center"
    >
      <i class="fa-solid fa-chart-simple text-slate-300 text-3xl mb-3"></i>
      <p class="text-sm text-slate-400 font-medium">
        Belum ada data sensor tercatat.
      </p>
    </div>

    <div v-else class="space-y-5">
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <h3
          class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"
        >
          Grafik Suhu (°C)
        </h3>
        <VueApexCharts
          type="area"
          height="250"
          :options="suhuOptions"
          :series="suhuSeries"
        />
      </div>

      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <h3
          class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"
        >
          Grafik Kelembaban (%)
        </h3>
        <VueApexCharts
          type="area"
          height="250"
          :options="lembabOptions"
          :series="lembabSeries"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";
import api from "../services/api";

const isLoading = ref(false);

// --- PERBAIKAN: Variabel ini wajib ditambahkan kembali ---
const chartCategories = ref([]);
// ---------------------------------------------------------

const suhuSeries = ref([
  { name: "Suhu Dalam (BME)", data: [] },
  { name: "Suhu Luar (DHT)", data: [] },
]);
const lembabSeries = ref([
  { name: "Lembab Dalam (BME)", data: [] },
  { name: "Lembab Luar (DHT)", data: [] },
]);

// Fungsi dinamis untuk membuat opsi grafik
const getChartOptions = (colors, suffix) => ({
  chart: {
    type: "area",
    fontFamily: "inherit",
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: colors,
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },

  markers: {
    size: 4,
    strokeWidth: 2,
    hover: { size: 6 },
  },

  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100],
    },
  },

  xaxis: {
    categories: [],
    labels: {
      style: { colors: "#94a3b8", fontSize: "10px", fontWeight: "bold" },
      rotate: -45,
    },
    tickAmount: 5,
    tooltip: { enabled: false },
  },

  yaxis: {
    labels: {
      style: { colors: "#94a3b8", fontSize: "10px", fontWeight: "bold" },
    },
  },

  grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },

  legend: {
    position: "top",
    horizontalAlign: "left",
    fontSize: "11px",
    fontWeight: "bold",
    markers: { radius: 12 },
  },

  tooltip: {
    theme: "light",
    shared: true,
    intersect: false,
    y: {
      formatter: function (val) {
        return val + suffix;
      },
    },
  },
});

const suhuOptions = ref(getChartOptions(["#059669", "#f59e0b"], " °C"));
const lembabOptions = ref(getChartOptions(["#0ea5e9", "#8b5cf6"], " %"));

const formatJamSaja = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fetchChartData = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/telemetry/logs");
    const data = response.data.reverse();

    // Ambil array jam
    const categoriesJam = data.map((item) =>
      formatJamSaja(item.waktu || item.timestamp),
    );

    // Perbarui chartCategories agar tampilan template tidak blank
    chartCategories.value = categoriesJam;

    // Perbarui sumbu X di kedua opsi grafik secara reaktif
    suhuOptions.value = {
      ...suhuOptions.value,
      xaxis: { ...suhuOptions.value.xaxis, categories: categoriesJam },
    };
    lembabOptions.value = {
      ...lembabOptions.value,
      xaxis: { ...lembabOptions.value.xaxis, categories: categoriesJam },
    };

    // Masukkan data sensor
    suhuSeries.value = [
      {
        name: "Suhu Dalam (BME)",
        data: data.map((item) => item.suhu_bme || 0),
      },
      { name: "Suhu Luar (DHT)", data: data.map((item) => item.suhu_dht || 0) },
    ];

    lembabSeries.value = [
      {
        name: "Lembab Dalam (BME)",
        data: data.map((item) => item.kelembaban_bme || 0),
      },
      {
        name: "Lembab Luar (DHT)",
        data: data.map((item) => item.kelembaban_dht || 0),
      },
    ];
  } catch (error) {
    console.error("Gagal mengambil data riwayat sensor:", error);
    chartCategories.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchChartData();
});
</script>
