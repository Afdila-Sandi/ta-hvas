<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-xl font-extrabold text-slate-800 tracking-tight">
        Laporan Sampling
      </h1>
      <p class="text-xs text-slate-500 mt-1">
        Buat sesi sampling baru dan ekspor data ke Excel.
      </p>
    </header>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2
        class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4"
      >
        Sesi Sampling Baru
      </h2>

      <form @submit.prevent="buatSesiSampling" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1"
            >Tempat Sampling</label
          >
          <input
            v-model="form.tempat_sampling"
            type="text"
            required
            placeholder="Contoh: Ruang Server BSPJI"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1"
            >Parameter Uji</label
          >
          <input
            v-model="form.parameter_uji"
            type="text"
            required
            placeholder="Contoh: Kualitas Udara Ambien"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1"
            >Perusahaan / Instansi</label
          >
          <input
            v-model="form.perusahaan"
            type="text"
            required
            placeholder="Contoh: PT Semen Padang"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1"
              >Tanggal Mulai</label
            >
            <input
              v-model="form.tanggal_mulai"
              type="date"
              required
              class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1"
              >Jam Mulai</label
            >
            <input
              v-model="form.jam_mulai"
              type="time"
              required
              class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="sedangMembuat"
          class="w-full bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center"
        >
          <i
            class="fa-solid fa-plus mr-2"
            :class="{ 'animate-spin': sedangMembuat }"
          ></i>
          Buat Sesi Sampling
        </button>
      </form>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2
          class="text-xs font-bold text-slate-500 uppercase tracking-widest"
        >
          Riwayat Sesi Saya
        </h2>
      </div>

      <div v-if="daftarSesi.length === 0" class="p-8 text-center text-slate-400 text-sm">
        <i class="fa-solid fa-folder-open text-2xl mb-2 opacity-50 block"></i>
        Belum ada sesi sampling.
      </div>

      <ul v-else class="divide-y divide-slate-100">
        <li
          v-for="sesi in daftarSesi"
          :key="sesi.id"
          class="p-4 hover:bg-slate-50 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <p class="text-sm font-bold text-slate-800">
                {{ sesi.perusahaan }}
              </p>
              <p class="text-xs text-slate-500">
                {{ sesi.tempat_sampling }} &middot; {{ sesi.parameter_uji }}
              </p>
              <p class="text-[10px] text-slate-400">
                {{ formatTanggal(sesi.waktu_mulai) }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="lihatData(sesi)"
                class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all active:scale-95"
              >
                <i class="fa-solid fa-eye mr-1"></i> Lihat
              </button>
              <button
                @click="hapusSesi(sesi.id)"
                class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-all active:scale-95"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div
      v-if="sesiAktif"
      class="bg-white rounded-2xl border border-slate-200 shadow-sm"
    >
      <div
        class="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"
      >
        <div>
          <h2 class="text-sm font-bold text-slate-800">
            {{ sesiAktif.perusahaan }}
          </h2>
          <p class="text-[10px] text-slate-400">
            {{ sesiAktif.tempat_sampling }} &middot; {{ sesiAktif.parameter_uji }}
          </p>
        </div>
        <button
          @click="unduhLaporanExcel"
          :disabled="data24Jam.length === 0"
          class="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center"
        >
          <i class="fa-solid fa-file-excel mr-2"></i> Ekspor
        </button>
      </div>

      <div class="flex-1 overflow-x-auto overflow-y-auto max-h-[400px]">
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
            <tr v-if="data24Jam.length === 0 && !sedangMemuatData">
              <td
                colspan="6"
                class="px-6 py-12 text-center text-slate-400 text-sm"
              >
                <i
                  class="fa-solid fa-magnifying-glass-chart text-2xl mb-2 opacity-50 block"
                ></i>
                Klik "Lihat" pada sesi sampling untuk melihat data.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../services/api";

const daftarSesi = ref([]);
const sesiAktif = ref(null);
const data24Jam = ref([]);
const sedangMembuat = ref(false);
const sedangMemuatData = ref(false);

const form = reactive({
  tempat_sampling: "",
  parameter_uji: "Kualitas Udara Ambien",
  perusahaan: "",
  tanggal_mulai: "",
  jam_mulai: "",
});

const ambilDaftarSesi = async () => {
  try {
    const res = await api.get("/telemetry/sampling");
    daftarSesi.value = res.data;
  } catch (error) {
    console.error("Gagal mengambil sesi sampling:", error);
  }
};

const buatSesiSampling = async () => {
  sedangMembuat.value = true;
  try {
    const payload = {
      tempat_sampling: form.tempat_sampling,
      parameter_uji: form.parameter_uji,
      perusahaan: form.perusahaan,
      waktu_mulai: `${form.tanggal_mulai}T${form.jam_mulai}:00`,
    };
    await api.post("/telemetry/sampling", payload);
    form.tempat_sampling = "";
    form.parameter_uji = "Kualitas Udara Ambien";
    form.perusahaan = "";
    form.tanggal_mulai = "";
    form.jam_mulai = "";
    await ambilDaftarSesi();
  } catch (error) {
    alert(error.response?.data?.message || "Gagal membuat sesi sampling");
  } finally {
    sedangMembuat.value = false;
  }
};

const lihatData = async (sesi) => {
  sesiAktif.value = sesi;
  data24Jam.value = [];
  sedangMemuatData.value = true;

  try {
    const response = await api.get("/telemetry/logs");
    const semuaData = response.data;

    const startTimestamp = new Date(sesi.waktu_mulai).getTime();
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
  } finally {
    sedangMemuatData.value = false;
  }
};

const hapusSesi = async (id) => {
  if (!confirm("Hapus sesi sampling ini?")) return;
  try {
    await api.delete(`/telemetry/sampling/${id}`);
    if (sesiAktif.value?.id === id) {
      sesiAktif.value = null;
      data24Jam.value = [];
    }
    await ambilDaftarSesi();
  } catch (error) {
    alert("Gagal menghapus sesi sampling.");
  }
};

const formatDateTimeStr = (dateObj) => {
  return (
    dateObj.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
};

const formatTanggal = (waktu) => {
  return new Date(waktu).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const unduhLaporanExcel = () => {
  if (data24Jam.value.length === 0 || !sesiAktif.value) return;

  const s = sesiAktif.value;
  const tglMulaiObj = new Date(s.waktu_mulai);
  const tglSelesaiObj = new Date(tglMulaiObj.getTime() + 24 * 60 * 60 * 1000);

  const formatTgl = (d) =>
    d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  let csv = "LAPORAN HASIL PENGUJIAN KUALITAS UDARA\n\n";
  csv += `Nama Perusahaan / Instansi ;: ${s.perusahaan.toUpperCase()}\n`;
  csv += `Parameter Pengujian        ;: ${s.parameter_uji}\n`;
  csv += `Petugas Teknisi / Sampler  ;: ${s.nama_teknisi}\n`;
  csv += `Tempat Sampling            ;: ${s.tempat_sampling}\n`;
  csv += `Tanggal Pengambilan        ;: ${formatTgl(tglMulaiObj)} s.d ${formatTgl(tglSelesaiObj)}\n\n`;
  csv += "Jam Ke-;Waktu Pengambilan;Suhu Ruang Box (°C);Kelembaban Ruang Box (%);Suhu Lingkungan (°C);Kelembaban Lingkungan (%)\n";

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
