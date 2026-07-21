<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-xl font-extrabold text-slate-800 tracking-tight">
        Sesi Sampling
      </h1>
      <p class="text-xs text-slate-500 mt-1">
        {{ blockedByOther ? "Sesi sampling aktif dari teknisi lain." : "Buat sesi sampling baru untuk mengakses kontrol alat." }}
      </p>
    </header>

    <div v-if="blockedByOther && otherSession" class="space-y-4">
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <i class="fa-solid fa-user-lock text-amber-600"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-amber-800">Sesi Sedang Berjalan</p>
            <p class="text-xs text-amber-600">Teknisi lain sedang melakukan sampling</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <p class="text-sm font-bold text-slate-800">
              {{ otherSession.perusahaan }}
            </p>
            <p class="text-xs text-slate-500">
              {{ otherSession.tempat_sampling }}
            </p>
            <p class="text-xs text-slate-500">
              {{ otherSession.parameter_uji }}
            </p>
            <p class="text-[10px] text-slate-400">
              {{ otherSession.nama_teknisi }} &middot; {{ formatTanggal(otherSession.waktu_mulai) }}
            </p>
            <p class="text-[10px] text-slate-400">
              Cuaca: {{ otherSession.kondisi_cuaca }}
            </p>
          </div>
        </div>
        <div class="pt-2 border-t border-slate-100">
          <p class="text-xs text-slate-500">
            <i class="fa-solid fa-circle-info mr-1"></i>
            Anda hanya bisa melakukan monitoring. Kontrol alat akan terbuka setelah sesi ini selesai (24 jam).
          </p>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
        Data Sampling
      </h2>

      <form @submit.prevent="buatSesiSampling" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1"
            >Perusahaan / Instansi</label
          >
          <input
            v-model="form.perusahaan"
            type="text"
            required
            placeholder="Contoh: BSPJI Padang"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1"
            >Titik Sampling</label
          >
          <input
            v-model="form.tempat_sampling"
            type="text"
            required
            placeholder="Contoh: Depan kantor BSPJI"
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
            >Kondisi Cuaca</label
          >
          <select
            v-model="form.kondisi_cuaca"
            required
            class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
          >
            <option value="" disabled>Pilih Kondisi Cuaca</option>
            <option value="Cerah">Cerah</option>
            <option value="Berawan">Berawan</option>
            <option value="Mendung">Mendung</option>
            <option value="Hujan Ringan">Hujan Ringan</option>
            <option value="Hujan Lebat">Hujan Lebat</option>
            <option value="Gerimis">Gerimis</option>
            <option value="Berangin">Berangin</option>
            <option value="custom">Lainnya (isi sendiri)...</option>
          </select>
          <input
            v-if="form.kondisi_cuaca === 'custom'"
            v-model="form.kondisi_cuaca_custom"
            type="text"
            required
            placeholder="Masukkan kondisi cuaca..."
            class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50 mt-2"
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
            <select
              v-model="form.jam_mulai"
              required
              class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50 text-slate-700 font-semibold"
            >
              <option value="" disabled>Pilih Jam</option>
              <option
                v-for="h in 24"
                :key="h - 1"
                :value="String(h - 1).padStart(2, '0') + ':00'"
              >
                {{ String(h - 1).padStart(2, '0') }} WIB
              </option>
            </select>
          </div>
        </div>

        <div v-if="lokasiStatus" class="flex items-center gap-2 text-xs text-slate-500">
          <i class="fa-solid fa-location-dot" :class="form.latitude ? 'text-emerald-500' : 'text-amber-500'"></i>
          <span>{{ lokasiStatus }}</span>
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
          Mulai Sampling
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../services/api";

const props = defineProps({
  blockedByOther: Boolean,
  otherSession: Object,
});

const emit = defineEmits(["session-created"]);

const sedangMembuat = ref(false);
const lokasiStatus = ref("");

const form = reactive({
  tempat_sampling: "",
  parameter_uji: "Kualitas Udara Ambien",
  perusahaan: "",
  tanggal_mulai: "",
  jam_mulai: "",
  kondisi_cuaca: "",
  kondisi_cuaca_custom: "",
  latitude: null,
  longitude: null,
});

const parseWaktuWIB = (waktuStr) => {
  return new Date(waktuStr.replace(/Z$/, "").replace(/\+00:00$/, "") + "+07:00");
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

const inisialisasiWaktu = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  form.tanggal_mulai = `${year}-${month}-${day}`;

  const currentHour = now.getHours();
  form.jam_mulai = String(currentHour).padStart(2, "0") + ":00";
};

const ambilLokasi = () => {
  if (!navigator.geolocation) {
    lokasiStatus.value = "Geolocation tidak didukung browser";
    return;
  }

  lokasiStatus.value = "Mengambil lokasi...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.latitude = pos.coords.latitude;
      form.longitude = pos.coords.longitude;
      lokasiStatus.value = `Lokasi terdeteksi (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
    },
    (err) => {
      lokasiStatus.value = "Lokasi tidak tersedia, input manual koordinat jika diperlukan";
      console.warn("Geolocation error:", err.message);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
};

const buatSesiSampling = async () => {
  sedangMembuat.value = true;
  try {
    const kondisiCuacaAkhir = form.kondisi_cuaca === "custom"
      ? form.kondisi_cuaca_custom
      : form.kondisi_cuaca;

    const payload = {
      tempat_sampling: form.tempat_sampling,
      parameter_uji: form.parameter_uji,
      perusahaan: form.perusahaan,
      waktu_mulai: `${form.tanggal_mulai}T${form.jam_mulai}:00`,
      kondisi_cuaca: kondisiCuacaAkhir,
      latitude: form.latitude,
      longitude: form.longitude,
    };
    await api.post("/telemetry/sampling", payload);
    emit("session-created");
  } catch (error) {
    alert(error.response?.data?.message || "Gagal membuat sesi sampling");
  } finally {
    sedangMembuat.value = false;
  }
};

onMounted(() => {
  inisialisasiWaktu();
  ambilLokasi();
});
</script>
