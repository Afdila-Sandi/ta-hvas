<template>
  <div class="space-y-6 pb-6">
    <header
      class="flex flex-col md:flex-row md:justify-between md:items-end gap-4"
    >
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
          Analitik Pusat HVAS
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Ringkasan performa dan kondisi lingkungan laboratorium.
        </p>
      </div>

      <div class="flex bg-slate-100 p-1 rounded-xl w-fit shadow-inner">
        <button
          v-for="waktu in ['1', '6', '24']"
          :key="waktu"
          @click="setFilterWaktu(waktu)"
          class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all"
          :class="
            filterAktif === waktu
              ? 'bg-white shadow-sm text-emerald-600'
              : 'text-slate-400 hover:text-slate-600'
          "
        >
          {{ waktu }} Jam
        </button>
      </div>
    </header>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
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
        class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
      >
        <span
          class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2"
          >Motor Pompa</span
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
        class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
      >
        <span
          class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2"
          >Suhu Alat (ESP)</span
        >
        <div class="text-2xl font-black text-slate-800">
          {{ sensorData.suhu_esp || 0 }}
          <span class="text-sm font-medium text-slate-400">°C</span>
        </div>
      </div>

      <div
        class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
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
    </div>

    <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4"
      >
        <div
          class="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 mt-1"
        >
          <i class="fa-solid fa-temperature-half text-lg"></i>
        </div>
        <div>
          <p
            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1"
          >
            Rata-rata Suhu ({{ filterAktif }} Jam)
          </p>
          <div class="flex items-baseline gap-2 mb-1.5">
            <span class="text-2xl font-black text-slate-800"
              >{{ avgSuhu }}°C</span
            >
            <span
              class="text-xs font-bold px-2 py-0.5 rounded-md"
              :class="analisisMakroSuhu.bgBadge"
            >
              {{ analisisMakroSuhu.status }}
            </span>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">
            {{ analisisMakroSuhu.pesan }}
          </p>
        </div>
      </div>

      <div
        class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4"
      >
        <div
          class="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500 shrink-0 mt-1"
        >
          <i class="fa-solid fa-droplet text-lg"></i>
        </div>
        <div>
          <p
            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1"
          >
            Rata-rata Lembab ({{ filterAktif }} Jam)
          </p>
          <div class="flex items-baseline gap-2 mb-1.5">
            <span class="text-2xl font-black text-slate-800"
              >{{ avgLembab }}%</span
            >
            <span
              class="text-xs font-bold px-2 py-0.5 rounded-md"
              :class="analisisMakroLembab.bgBadge"
            >
              {{ analisisMakroLembab.status }}
            </span>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">
            {{ analisisMakroLembab.pesan }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="p-10 text-center bg-white rounded-2xl shadow-sm border border-slate-100"
    >
      <i
        class="fa-solid fa-circle-notch fa-spin text-emerald-500 text-2xl mb-3"
      ></i>
      <p class="text-xs font-bold text-slate-500">
        Mengkalkulasi data {{ filterAktif }} jam terakhir...
      </p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2
          class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"
        >
          Tren Suhu (°C) - {{ filterAktif }} Jam
        </h2>
        <VueApexCharts
          type="area"
          height="250"
          :options="suhuOptions"
          :series="suhuSeries"
        />
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2
          class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"
        >
          Tren Kelembaban (%) - {{ filterAktif }} Jam
        </h2>
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
import { initWebSocket, isConnected, sensorData } from "../services/ws";

const isLoading = ref(false);
const filterAktif = ref("1"); // Default 1 jam
const allDataRaw = ref([]); // Menyimpan semua data dari DB

// State Data Terfilter
const chartCategories = ref([]);
const suhuSeries = ref([]);
const lembabSeries = ref([]);

// State Averages (Rata-rata)
const avgSuhu = ref(0);
const avgLembab = ref(0);

// Konfigurasi Area Chart
const getAreaOptions = (colors) => ({
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
    categories: [],
    labels: { style: { colors: "#94a3b8" } },
    tickAmount: 6,
  },
  yaxis: { labels: { style: { colors: "#94a3b8" } } },
  grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
  legend: {
    position: "top",
    horizontalAlign: "right",
    fontSize: "11px",
    fontWeight: "bold",
  },
  tooltip: { theme: "light" },
});

const suhuOptions = ref(getAreaOptions(["#059669", "#f59e0b"]));
const lembabOptions = ref(getAreaOptions(["#0ea5e9", "#8b5cf6"]));

// Fungsi Helper Format Jam
const formatJamSaja = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- LOGIKA ANALISIS MAKRO ---
const analisisMakroSuhu = computed(() => {
  const suhu = parseFloat(avgSuhu.value);
  if (!suhu || suhu === 0)
    return {
      status: "-",
      pesan: "Menunggu data...",
      bgBadge: "bg-slate-100 text-slate-500",
    };

  if (suhu > 35)
    return {
      status: "Overheat",
      pesan: "Suhu sangat tinggi. Segera cek alat",
      bgBadge: "bg-rose-100 text-rose-600",
    };
  if (suhu > 31)
    return {
      status: "Cukup Panas",
      pesan: "Suhu beroperasi di atas suhu ideal.",
      bgBadge: "bg-amber-100 text-amber-600",
    };
  if (suhu >= 26)
    return {
      status: "Normal",
      pesan: "Suhu stabil sesuai dengan standar iklim tropis.",
      bgBadge: "bg-emerald-100 text-emerald-600",
    };
  return {
    status: "Dingin",
    pesan: "Suhu rata-rata rendah, pendingin bekerja optimal.",
    bgBadge: "bg-sky-100 text-sky-600",
  };
});

const analisisMakroLembab = computed(() => {
  const lembab = parseFloat(avgLembab.value);
  if (!lembab || lembab === 0)
    return { status: "-", pesan: "-", bgBadge: "bg-slate-100 text-slate-500" };

  if (lembab > 85)
    return {
      status: "Sangat Lembab",
      pesan: "Tingkat kelembaban udara tinggi. Cek perangkat elektronik.",
      bgBadge: "bg-rose-100 text-rose-600",
    };
  if (lembab >= 60)
    return {
      status: "Ideal",
      pesan: "Tingkat kelembaban udara normal.",
      bgBadge: "bg-emerald-100 text-emerald-600",
    };
  return {
    status: "Kering",
    pesan: "Udara cukup kering. aman untuk perangkat elektronik.",
    bgBadge: "bg-amber-100 text-amber-600",
  };
});

// Menerapkan Filter Waktu ke Data
const applyFilter = (hours) => {
  if (allDataRaw.value.length === 0) return;

  const waktuTerbaru = new Date(
    allDataRaw.value[allDataRaw.value.length - 1].waktu ||
      allDataRaw.value[allDataRaw.value.length - 1].timestamp,
  ).getTime();
  const batasWaktu = waktuTerbaru - parseInt(hours) * 60 * 60 * 1000;

  // Filter data berdasarkan waktu yang dipilih
  const filteredData = allDataRaw.value.filter(
    (item) => new Date(item.waktu || item.timestamp).getTime() >= batasWaktu,
  );

  // Jika tidak ada data yang masuk kriteria
  if (filteredData.length === 0) {
    avgSuhu.value = 0;
    avgLembab.value = 0;
    return;
  }

  const categories = filteredData.map((item) =>
    formatJamSaja(item.waktu || item.timestamp),
  );

  // Update X-Axis
  chartCategories.value = categories;
  suhuOptions.value = {
    ...suhuOptions.value,
    xaxis: { ...suhuOptions.value.xaxis, categories },
  };
  lembabOptions.value = {
    ...lembabOptions.value,
    xaxis: { ...lembabOptions.value.xaxis, categories },
  };

  // Pastikan data diparsing menjadi float agar matematika tidak error (Solusi NaN)
  const dataSuhuDalam = filteredData.map(
    (item) => parseFloat(item.suhu_bme) || 0,
  );
  const dataSuhuLuar = filteredData.map(
    (item) => parseFloat(item.suhu_dht) || 0,
  );
  const dataLembabDalam = filteredData.map(
    (item) => parseFloat(item.kelembaban_bme) || 0,
  );
  const dataLembabLuar = filteredData.map(
    (item) => parseFloat(item.kelembaban_dht) || 0,
  );

  // Update Series Grafik
  suhuSeries.value = [
    { name: "Suhu Dalam", data: dataSuhuDalam },
    { name: "Suhu Luar", data: dataSuhuLuar },
  ];

  lembabSeries.value = [
    { name: "Lembab Dalam", data: dataLembabDalam },
    { name: "Lembab Luar", data: dataLembabLuar },
  ];

  // Kalkulasi Averages (Rata-rata) dengan aman
  if (dataSuhuDalam.length > 0) {
    avgSuhu.value = (
      dataSuhuDalam.reduce((a, b) => a + b, 0) / dataSuhuDalam.length
    ).toFixed(1);
  }

  if (dataLembabDalam.length > 0) {
    avgLembab.value = (
      dataLembabDalam.reduce((a, b) => a + b, 0) / dataLembabDalam.length
    ).toFixed(1);
  }
};

const setFilterWaktu = (waktu) => {
  filterAktif.value = waktu;
  applyFilter(waktu);
};

// Fetch data awal saat komponen dimuat
const fetchDataAwal = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/telemetry/logs");
    allDataRaw.value = response.data.reverse();

    applyFilter(filterAktif.value); // Terapkan default (1 Jam)
  } catch (error) {
    console.error("Gagal mengambil data historis:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (!isConnected.value) initWebSocket();
  fetchDataAwal();
});
</script>
