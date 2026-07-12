<template>
  <div class="space-y-6 pb-6">
    <header>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
        Laporan Audit
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Lihat dan ekspor data sampling dari seluruh teknisi.
      </p>
    </header>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div class="p-5 border-b border-slate-100 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <div class="relative">
              <i
                class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
              ></i>
              <input
                v-model="cari"
                type="text"
                placeholder="Cari nama teknisi, perusahaan, tempat..."
                class="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr>
              <th
                class="px-5 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b"
              >
                Perusahaan
              </th>
              <th
                class="px-5 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b"
              >
                Tempat
              </th>
              <th
                class="px-5 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b"
              >
                Parameter
              </th>
              <th
                class="px-5 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b"
              >
                Teknisi
              </th>
              <th
                class="px-5 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b"
              >
                Waktu
              </th>
              <th
                class="px-5 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b text-center"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="sesi in sesiFiltered"
              :key="sesi.id"
              class="hover:bg-slate-50/50 cursor-pointer transition-colors"
              :class="sesiAktif?.id === sesi.id ? 'bg-emerald-50/50' : ''"
              @click="lihatData(sesi)"
            >
              <td class="px-5 py-3 text-sm font-bold text-slate-800">
                {{ sesi.perusahaan }}
              </td>
              <td class="px-5 py-3 text-sm text-slate-600">
                {{ sesi.tempat_sampling }}
              </td>
              <td class="px-5 py-3 text-sm text-slate-500">
                {{ sesi.parameter_uji }}
              </td>
              <td class="px-5 py-3 text-sm text-slate-600">
                {{ sesi.nama_teknisi }}
              </td>
              <td class="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                {{ formatTanggal(sesi.waktu_mulai) }}
              </td>
              <td class="px-5 py-3 text-center">
                <button
                  @click.stop="lihatData(sesi)"
                  class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all active:scale-95"
                >
                  <i class="fa-solid fa-eye mr-1"></i> Lihat
                </button>
              </td>
            </tr>
            <tr v-if="sesiFiltered.length === 0">
              <td
                colspan="6"
                class="px-6 py-12 text-center text-slate-400 text-sm"
              >
                <i
                  class="fa-solid fa-folder-open text-2xl mb-2 opacity-50 block"
                ></i>
                Tidak ada sesi sampling ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="sesiAktif"
      class="bg-white rounded-2xl border border-slate-200 shadow-sm"
    >
      <div
        class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
      >
        <div>
          <h2 class="text-sm font-bold text-slate-800">
            {{ sesiAktif.perusahaan }} &#8212; {{ sesiAktif.nama_teknisi }}
          </h2>
          <p class="text-[10px] text-slate-400 mt-0.5">
            {{ sesiAktif.tempat_sampling }} &#183;
            {{ sesiAktif.parameter_uji }} &#183;
            {{ formatTanggal(sesiAktif.waktu_mulai) }}
          </p>
        </div>
        <button
          @click="unduhLaporanExcel"
          :disabled="data24Jam.length === 0"
          class="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center shrink-0"
        >
          <i class="fa-solid fa-file-excel mr-2"></i> Ekspor ke Excel
        </button>
      </div>

      <div class="overflow-x-auto overflow-y-auto max-h-[400px]">
        <table class="w-full text-left border-collapse">
          <thead class="sticky top-0 z-10">
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
                Suhu Dalam (&deg;C)
              </th>
              <th
                class="px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b text-center"
              >
                Lembab Dalam (%)
              </th>
              <th
                class="px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b text-center"
              >
                Suhu Luar (&deg;C)
              </th>
              <th
                class="px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b text-center"
              >
                Lembab Luar (%)
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
              <td class="px-4 py-3 text-xs text-slate-600 text-center">
                {{ row.kelembaban_dht }}
              </td>
            </tr>
            <tr v-if="data24Jam.length === 0">
              <td
                colspan="6"
                class="px-6 py-12 text-center text-slate-400 text-sm"
              >
                <i
                  class="fa-solid fa-magnifying-glass-chart text-2xl mb-2 opacity-50 block"
                ></i>
                Pilih sesi sampling untuk melihat data sensor.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../services/api";

const daftarSesi = ref([]);
const sesiAktif = ref(null);
const data24Jam = ref([]);
const cari = ref("");
const filterDari = ref("");
const filterSampai = ref("");

const parseWaktuWIB = (waktuStr) => {
  return new Date(waktuStr.replace(/Z$/, "").replace(/\+00:00$/, "") + "+07:00");
};

const sesiFiltered = computed(() => {
  let hasil = daftarSesi.value;

  if (cari.value.trim()) {
    const q = cari.value.toLowerCase();
    hasil = hasil.filter(
      (s) =>
        s.nama_teknisi.toLowerCase().includes(q) ||
        s.perusahaan.toLowerCase().includes(q) ||
        s.tempat_sampling.toLowerCase().includes(q) ||
        s.parameter_uji.toLowerCase().includes(q),
    );
  }

  if (filterDari.value) {
    const dari = new Date(filterDari.value).getTime();
    hasil = hasil.filter((s) => parseWaktuWIB(s.waktu_mulai).getTime() >= dari);
  }

  if (filterSampai.value) {
    const sampai = new Date(filterSampai.value).getTime() + 86400000;
    hasil = hasil.filter((s) => parseWaktuWIB(s.waktu_mulai).getTime() <= sampai);
  }

  return hasil;
});

const ambilDaftarSesi = async () => {
  try {
    const res = await api.get("/telemetry/sampling");
    daftarSesi.value = res.data;
  } catch (error) {
    console.error("Gagal mengambil sesi sampling:", error);
  }
};

const lihatData = async (sesi) => {
  sesiAktif.value = sesi;
  data24Jam.value = [];

  try {
    const response = await api.get("/telemetry/logs");
    const semuaData = response.data;

    const startTimestamp = parseWaktuWIB(sesi.waktu_mulai).getTime();
    const endTimestamp = startTimestamp + 24 * 60 * 60 * 1000;

    const dataDalamRentang = semuaData.filter((item) => {
      const time = new Date(item.waktu || item.timestamp).getTime();
      return time >= startTimestamp && time <= endTimestamp;
    });

    const hitunganPerJam = [];
    for (let i = 0; i < 24; i++) {
      const jamMulaiSlot = startTimestamp + i * 60 * 60 * 1000;
      const jamSelesaiSlot = jamMulaiSlot + 60 * 60 * 1000 - 1;

      const dataDiSlot = dataDalamRentang.filter((item) => {
        const time = new Date(item.waktu || item.timestamp).getTime();
        return time >= jamMulaiSlot && time <= jamSelesaiSlot;
      });

      const labelWaktu = formatDateTimeStr(new Date(jamMulaiSlot));

      if (dataDiSlot.length > 0) {
        const avg = (arr, key) =>
          (
            arr.reduce((a, c) => a + (parseFloat(c[key]) || 0), 0) / arr.length
          ).toFixed(1);

        hitunganPerJam.push({
          labelWaktu,
          suhu_bme: avg(dataDiSlot, "suhu_bme"),
          kelembaban_bme: avg(dataDiSlot, "kelembaban_bme"),
          suhu_dht: avg(dataDiSlot, "suhu_dht"),
          kelembaban_dht: avg(dataDiSlot, "kelembaban_dht"),
        });
      } else {
        hitunganPerJam.push({
          labelWaktu,
          suhu_bme: "-",
          kelembaban_bme: "-",
          suhu_dht: "-",
          kelembaban_dht: "-",
        });
      }
    }

    data24Jam.value = hitunganPerJam;
  } catch (error) {
    console.error("Gagal memuat data:", error);
    alert("Gagal mengambil data sensor.");
  }
};

const formatTanggal = (waktu) => {
  return parseWaktuWIB(waktu).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

const unduhLaporanExcel = () => {
  if (data24Jam.value.length === 0 || !sesiAktif.value) return;

  const s = sesiAktif.value;
  const tglMulaiObj = parseWaktuWIB(s.waktu_mulai);
  const tglSelesaiObj = new Date(tglMulaiObj.getTime() + 24 * 60 * 60 * 1000);

  let csv = "LAPORAN HASIL PENGUJIAN KUALITAS UDARA\n\n";
  csv += `Nama Perusahaan / Instansi ;: ${s.perusahaan.toUpperCase()}\n`;
  csv += `Parameter Pengujian        ;: ${s.parameter_uji}\n`;
  csv += `Petugas Teknisi / Sampler  ;: ${s.nama_teknisi}\n`;
  csv += `Tempat Sampling            ;: ${s.tempat_sampling}\n`;
  csv += `Kondisi Cuaca              ;: ${s.kondisi_cuaca || "-"}\n`;
  csv += `Tanggal Pengambilan        ;: ${formatDateLengkap(tglMulaiObj)} s.d ${formatDateLengkap(tglSelesaiObj)}\n\n`;
  csv += "Jam Ke-;Waktu Pengambilan;Suhu Ruang Box (C);Kelembaban Ruang Box (%);Suhu Lingkungan (C);Kelembaban Lingkungan (%)\n";

  data24Jam.value.forEach((row, i) => {
    const suhuBme = row.suhu_bme !== "-" ? row.suhu_bme.replace(".", ",") : "-";
    const lembabBme = row.kelembaban_bme !== "-" ? row.kelembaban_bme.replace(".", ",") : "-";
    const suhuDht = row.suhu_dht !== "-" ? row.suhu_dht.replace(".", ",") : "-";
    const lembabDht = row.kelembaban_dht !== "-" ? row.kelembaban_dht.replace(".", ",") : "-";
    csv += `Jam ${i + 1};${row.labelWaktu};${suhuBme};${lembabBme};${suhuDht};${lembabDht}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const namaFile = s.perusahaan.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  link.setAttribute("href", url);
  link.setAttribute("download", `Laporan_HVAS_${namaFile}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  ambilDaftarSesi();
});
</script>
