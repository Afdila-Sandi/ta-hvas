<template>
  <div class="space-y-6 pb-6">
    <div class="flex justify-between items-center px-1">
      <div>
        <h2 class="text-sm font-bold text-slate-800 uppercase tracking-widest">
          Grafik & Analisis Lingkungan
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
      v-if="!isLoading && chartCategories.length > 0"
      class="px-3 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 mt-0.5"
        >
          <i class="fa-solid fa-temperature-half text-sm"></i>
        </div>
        <div>
          <p class="text-sm">
            <span class="font-bold text-slate-700 mr-2">Evaluasi Suhu:</span>
            <span :class="analisisSuhu.warna" class="font-black">{{
              analisisSuhu.status
            }}</span>
          </p>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            {{ analisisSuhu.pesan }}
          </p>
        </div>
      </div>

      <div class="h-px w-full bg-slate-50"></div>

      <div class="flex items-start gap-3">
        <div
          class="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500 shrink-0 mt-0.5"
        >
          <i class="fa-solid fa-droplet text-sm"></i>
        </div>
        <div>
          <p class="text-sm">
            <span class="font-bold text-slate-700 mr-2"
              >Evaluasi Kelembaban:</span
            >
            <span :class="analisisLembab.warna" class="font-black">{{
              analisisLembab.status
            }}</span>
          </p>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            {{ analisisLembab.pesan }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-center"
    >
      <i
        class="fa-solid fa-circle-notch fa-spin text-emerald-500 text-2xl mb-3"
      ></i>
      <p class="text-xs font-bold text-slate-500">
        Memuat data 1 jam terakhir...
      </p>
    </div>

    <div
      v-else-if="chartCategories.length === 0"
      class="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-center"
    >
      <i class="fa-solid fa-chart-simple text-slate-300 text-3xl mb-3"></i>
      <p class="text-sm text-slate-400 font-medium">
        Belum ada data riwayat sensor.
      </p>
    </div>

    <div v-else class="space-y-5">
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <h3
          class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"
        >
          Suhu (°C) - 1 Jam Terakhir
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
          Kelembaban (%) - 1 Jam Terakhir
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
import { ref, computed, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";
import api from "../services/api";

const isLoading = ref(false);
const chartCategories = ref([]);

// State untuk menyimpan data sensor terakhir dari database
const suhuDalamTerakhir = ref(0);
const suhuLuarTerakhir = ref(0);
const lembabDalamTerakhir = ref(0);
const lembabLuarTerakhir = ref(0);

const suhuSeries = ref([
  { name: "Suhu Dalam (BME)", data: [] },
  { name: "Suhu Luar (DHT)", data: [] },
]);
const lembabSeries = ref([
  { name: "Lembab Dalam (BME)", data: [] },
  { name: "Lembab Luar (DHT)", data: [] },
]);

// Konfigurasi Grafik
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
  markers: { size: 4, strokeWidth: 2, hover: { size: 6 } },
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
    tickAmount: 6,
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
  return new Date(dateString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const analisisSuhu = computed(() => {
  const sDalam = suhuDalamTerakhir.value;
  const sLuar = suhuLuarTerakhir.value;

  if (sDalam === 0 && sLuar === 0)
    return {
      status: "Menunggu Data",
      pesan: "Sedang memuat data terbaru.",
      warna: "text-slate-400",
    };

  const selisih = sDalam - sLuar;
  let status = "";
  let warna = "";
  let pesan = `(Dalam: ${sDalam}°C | Luar: ${sLuar}°C). `;

  // Standar Suhu 
  if (sDalam > 38) {
    status = "Overheat!";
    warna = "text-rose-600";
    pesan +=
      "Suhu ekstrem.";
  } else if (sDalam > 35) {
    status = "Cukup Panas";
    warna = "text-orange-500";
  } else if (sDalam >= 29) {
    status = "Normal";
    warna = "text-emerald-600";
  } else {
    status = "Dingin";
    warna = "text-blue-500";
  }

  // Analisis Komparatif Box
  if (selisih > 2) {
    pesan +=
      "Suhu dalam box panas.";
  } else if (selisih < -1) {
    pesan += "Pendinginan optimal.";
  } else {
    pesan += "Sirkulasi aman.";
  }

  return { status, pesan, warna };
});

const analisisLembab = computed(() => {
  const lDalam = lembabDalamTerakhir.value;
  const lLuar = lembabLuarTerakhir.value;

  if (lDalam === 0)
    return { status: "Menunggu Data", pesan: "-", warna: "text-slate-400" };

  let status = "";
  let warna = "";
  let pesan = `(Dalam: ${lDalam}% | Luar: ${lLuar}%). `;

  if (lDalam > 85) {
    status = "Sangat Lembab";
    warna = "text-sky-600";
    pesan +=
      "Udara Lembab";
  } else if (lDalam >= 60) {
    status = "Normal";
    warna = "text-emerald-600";
    pesan += "Kondisi ideal.";
  } else {
    status = "Kering";
    warna = "text-amber-500";
    pesan +=
      "Udara cukup kering.";
  }

  return { status, pesan, warna };
});

const fetchChartData = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/telemetry/logs");
    let allData = response.data.reverse();

    // Ambil data 1 Jam Terakhir
    if (allData.length > 0) {
      const waktuTerbaru = new Date(
        allData[allData.length - 1].waktu ||
          allData[allData.length - 1].timestamp,
      ).getTime();
      const satuJamLalu = waktuTerbaru - 60 * 60 * 1000;
      allData = allData.filter(
        (item) =>
          new Date(item.waktu || item.timestamp).getTime() >= satuJamLalu,
      );

      // Simpan data terakhir
      const dataTerakhir = allData[allData.length - 1];
      suhuDalamTerakhir.value = dataTerakhir.suhu_bme || 0;
      suhuLuarTerakhir.value = dataTerakhir.suhu_dht || 0;
      lembabDalamTerakhir.value = dataTerakhir.kelembaban_bme || 0;
      lembabLuarTerakhir.value = dataTerakhir.kelembaban_dht || 0;
    }

    const categoriesJam = allData.map((item) =>
      formatJamSaja(item.waktu || item.timestamp),
    );
    chartCategories.value = categoriesJam;

    suhuOptions.value = {
      ...suhuOptions.value,
      xaxis: { ...suhuOptions.value.xaxis, categories: categoriesJam },
    };
    lembabOptions.value = {
      ...lembabOptions.value,
      xaxis: { ...lembabOptions.value.xaxis, categories: categoriesJam },
    };

    suhuSeries.value = [
      {
        name: "Suhu Dalam",
        data: allData.map((item) => item.suhu_bme || 0),
      },
      {
        name: "Suhu Luar",
        data: allData.map((item) => item.suhu_dht || 0),
      },
    ];
    lembabSeries.value = [
      {
        name: "Lembab Dalam",
        data: allData.map((item) => item.kelembaban_bme || 0),
      },
      {
        name: "Lembab Luar",
        data: allData.map((item) => item.kelembaban_dht || 0),
      },
    ];
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchChartData();
});
</script>
