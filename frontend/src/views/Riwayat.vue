<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div
        class="bg-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Riwayat Sensor HVAS</h1>
          <p class="text-sm text-slate-500 mt-1">
            Data historis dengan interval 5 menit
          </p>
        </div>
        <button
          @click="router.push('/dashboard')"
          class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors"
        >
          &larr; Kembali ke Dashboard
        </button>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-slate-800">
            Grafik Fluktuasi Suhu
          </h2>
          <button
            @click="ambilDataRiwayat"
            :disabled="isLoading"
            class="text-sm px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold rounded-md disabled:opacity-50"
          >
            <span v-if="isLoading">Memuat...</span>
            <span v-else>Segarkan Data</span>
          </button>
        </div>

        <div class="relative h-72 md:h-96 w-full">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, shallowRef } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import api from "../services/api";

const router = useRouter();
const chartCanvas = ref(null);
const chartInstance = shallowRef(null);
const isLoading = ref(false);

const ambilDataRiwayat = async () => {
  isLoading.value = true;
  try {
    const res = await api.get("/monitor/history");
    if (res.data && res.data.data) {
      renderGrafik(res.data.data.reverse());
    }
  } catch (error) {
    console.error("Gagal mengambil riwayat:", error);
    alert("Gagal memuat data riwayat dari peladen.");
  } finally {
    isLoading.value = false;
  }
};

const renderGrafik = (dataRows) => {
  const ctx = chartCanvas.value.getContext("2d");
  const labels = dataRows.map((row) => {
    const d = new Date(row.waktu);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  });

  const suhuBME = dataRows.map((row) => row.suhu_bme);
  const suhuDHT = dataRows.map((row) => row.suhu_dht);

  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  chartInstance.value = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Suhu BME280 (°C)",
          data: suhuBME,
          borderColor: "#3b82f6", 
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Suhu DHT22 (°C)",
          data: suhuDHT,
          borderColor: "#10b981", 
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: { display: true, text: "Derajat Celcius" },
        },
      },
    },
  });
};

onMounted(() => {
  ambilDataRiwayat();
});
</script>
