<template>
  <div class="space-y-6 pb-6">
    <header>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
        Generator Laporan Sampling
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Penyusunan data uji udara ambien 24 Jam ke format laporan resmi.
      </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1 h-fit"
      >
        <h2
          class="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b pb-2"
        >
          1. Identitas Pengujian
        </h2>

        <form @submit.prevent="prosesDataSampling" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1"
              >Nama Perusahaan / Pabrik</label
            >
            <input
              v-model="formLaporan.perusahaan"
              type="text"
              required
              placeholder="Contoh: PT. Semen Padang"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1"
              >Parameter Uji</label
            >
            <input
              v-model="formLaporan.parameter"
              type="text"
              required
              class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1"
              >Nama Teknisi / Petugas</label
            >
            <input
              v-model="formLaporan.teknisi"
              type="text"
              required
              class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
            />
          </div>

          <div class="pt-2 border-t mt-4">
            <label
              class="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide"
              >Waktu Mulai Sampling</label
            >
            <input
              v-model="formLaporan.waktuMulai"
              type="datetime-local"
              required
              class="w-full px-3 py-2 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-emerald-50 text-emerald-800 font-bold"
            />
            <p class="text-[10px] text-slate-400 mt-1">
              *Sistem otomatis mengambil data 24 jam ke depan dari waktu ini (1
              data/jam).
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full mt-4 bg-slate-800 text-white hover:bg-slate-900 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center"
          >
            <i
              class="fa-solid fa-gears mr-2"
              :class="{ 'animate-spin': isLoading }"
            ></i>
            Proses & Tarik Data
          </button>
        </form>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col overflow-hidden"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"
        >
          <h2
            class="text-xs font-bold text-slate-500 uppercase tracking-widest"
          >
            2. Pratinjau Data ({{ data24Jam.length }} Baris)
          </h2>
          <button
            @click="unduhLaporanExcel"
            :disabled="data24Jam.length === 0"
            class="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center shadow-md shadow-emerald-500/20"
          >
            <i class="fa-solid fa-file-excel mr-2"></i> Ekspor ke Excel
          </button>
        </div>

        <div class="flex-1 overflow-x-auto overflow-y-auto max-h-[500px]">
          <table class="w-full text-left border-collapse relative">
            <thead class="sticky top-0 z-10 shadow-sm">
              <tr>
                <th
                  class="px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b"
                >
                  Jam Ke-
                </th>
                <th
                  class="px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b"
                >
                  Waktu (WIB)
                </th>
                <th
                  class="px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b text-center"
                >
                  Suhu Dalam (°C)
                </th>
                <th
                  class="px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b text-center"
                >
                  Lembab Dalam (%)
                </th>
                <th
                  class="px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b text-center"
                >
                  Suhu Luar (°C)
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="(row, index) in data24Jam"
                :key="index"
                class="hover:bg-slate-50/50"
              >
                <td class="px-4 py-3 text-xs font-bold text-slate-400">
                  Jam {{ index + 1 }}
                </td>
                <td class="px-4 py-3 text-xs font-bold text-slate-700">
                  {{ row.labelWaktu }}
                </td>
                <td class="px-4 py-3 text-xs text-slate-600 text-center">
                  {{ row.suhu_bme }}
                </td>
                <td class="px-4 py-3 text-xs text-slate-600 text-center">
                  {{ row.kelembaban_bme }}
                </td>
                <td class="px-4 py-3 text-xs text-slate-600 text-center">
                  {{ row.suhu_dht }}
                </td>
              </tr>

              <tr v-if="data24Jam.length === 0">
                <td
                  colspan="5"
                  class="px-6 py-16 text-center text-slate-400 text-sm font-medium"
                >
                  <i
                    class="fa-solid fa-magnifying-glass-chart text-3xl mb-3 opacity-50 block"
                  ></i>
                  Isi formulir dan proses data untuk melihat pratinjau 24 jam.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import api from "../services/api";

const isLoading = ref(false);
const allDataRaw = ref([]);
const data24Jam = ref([]);

// Default Form 
const formLaporan = reactive({
  perusahaan: "",
  parameter: "Kualitas Udara Ambien",
  teknisi: "",
  waktuMulai: "",
});

// Format Waktu Tampil
const formatDateTimeStr = (dateObj) => {
  return (
    dateObj.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
};
const formatDateLengkap = (dateObj) => {
  return dateObj.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const prosesDataSampling = async () => {
  if (!formLaporan.waktuMulai) return;
  isLoading.value = true;
  data24Jam.value = [];

  try {
    const response = await api.get("/telemetry/logs");
    allDataRaw.value = response.data;

    const startTimestamp = new Date(formLaporan.waktuMulai).getTime();
    const endTimestamp = startTimestamp + 24 * 60 * 60 * 1000;

    const dataDalamRentang = allDataRaw.value.filter((item) => {
      const time = new Date(item.waktu || item.timestamp).getTime();
      return time >= startTimestamp && time <= endTimestamp;
    });

    if (dataDalamRentang.length === 0) {
      alert(
        "Tidak ada data sensor yang ditemukan pada rentang waktu tersebut.",
      );
      isLoading.value = false;
      return;
    }

    const hitunganPerJam = [];

    for (let i = 0; i < 24; i++) {
      const jamMulaiSlot = startTimestamp + i * 60 * 60 * 1000;
      const jamSelesaiSlot = jamMulaiSlot + 60 * 60 * 1000 - 1;

      const dataDiSlotIni = dataDalamRentang.filter((item) => {
        const time = new Date(item.waktu || item.timestamp).getTime();
        return time >= jamMulaiSlot && time <= jamSelesaiSlot;
      });

      const labelWaktu = formatDateTimeStr(new Date(jamMulaiSlot));

      if (dataDiSlotIni.length > 0) {
        const avgSuhuBme = (
          dataDiSlotIni.reduce(
            (acc, curr) => acc + (parseFloat(curr.suhu_bme) || 0),
            0,
          ) / dataDiSlotIni.length
        ).toFixed(1);
        const avgLembabBme = (
          dataDiSlotIni.reduce(
            (acc, curr) => acc + (parseFloat(curr.kelembaban_bme) || 0),
            0,
          ) / dataDiSlotIni.length
        ).toFixed(1);
        const avgSuhuDht = (
          dataDiSlotIni.reduce(
            (acc, curr) => acc + (parseFloat(curr.suhu_dht) || 0),
            0,
          ) / dataDiSlotIni.length
        ).toFixed(1);

        hitunganPerJam.push({
          labelWaktu: labelWaktu,
          suhu_bme: avgSuhuBme,
          kelembaban_bme: avgLembabBme,
          suhu_dht: avgSuhuDht,
        });
      } else {
        hitunganPerJam.push({
          labelWaktu: labelWaktu,
          suhu_bme: "-",
          kelembaban_bme: "-",
          suhu_dht: "-",
        });
      }
    }

    data24Jam.value = hitunganPerJam;
  } catch (error) {
    console.error("Gagal memproses data:", error);
    alert("Gagal mengambil data dari server.");
  } finally {
    isLoading.value = false;
  }
};

const unduhLaporanExcel = () => {
  if (data24Jam.value.length === 0) return;

  const tglMulaiObj = new Date(formLaporan.waktuMulai);
  const tglSelesaiObj = new Date(tglMulaiObj.getTime() + 24 * 60 * 60 * 1000);

  let csvContent = "LAPORAN HASIL PENGUJIAN KUALITAS UDARA\n\n";
  csvContent += `Nama Perusahaan / Instansi ;: ${formLaporan.perusahaan.toUpperCase()}\n`;
  csvContent += `Parameter Pengujian        ;: ${formLaporan.parameter}\n`;
  csvContent += `Petugas Teknisi / Sampler  ;: ${formLaporan.teknisi}\n`;
  csvContent += `Tanggal Pengambilan        ;: ${formatDateLengkap(tglMulaiObj)} s.d ${formatDateLengkap(tglSelesaiObj)}\n\n`;
  csvContent +=
    "Jam Ke-;Waktu Pengambilan;Suhu Ruang Box (°C);Kelembaban Ruang Box (%);Suhu Lingkungan (°C)\n";

  data24Jam.value.forEach((row, index) => {
    const suhuBmeIndo =
      row.suhu_bme !== "-" ? row.suhu_bme.replace(".", ",") : "-";
    const lembabBmeIndo =
      row.kelembaban_bme !== "-" ? row.kelembaban_bme.replace(".", ",") : "-";
    const suhuDhtIndo =
      row.suhu_dht !== "-" ? row.suhu_dht.replace(".", ",") : "-";

    const baris = [
      `Jam ${index + 1}`,
      row.labelWaktu,
      suhuBmeIndo,
      lembabBmeIndo,
      suhuDhtIndo,
    ].join(";"); 

    csvContent += baris + "\n";
  });

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const namaFileSafe = formLaporan.perusahaan
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  link.setAttribute("href", url);
  link.setAttribute("download", `Laporan_HVAS_${namaFileSafe}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
