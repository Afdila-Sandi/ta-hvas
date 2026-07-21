<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
        Data Teknisi
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Lihat daftar akun teknisi lapangan.
      </p>
    </header>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
      <ul class="divide-y divide-slate-100">
        <li
          v-for="teknisi in daftarTeknisi"
          :key="teknisi.id"
          class="p-4 flex justify-between items-center hover:bg-slate-50 rounded-xl transition-colors"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase border border-slate-200"
            >
              {{ teknisi.nama.substring(0, 2) }}
            </div>
            <div>
              <strong class="text-slate-800 block capitalize">{{
                teknisi.nama
              }}</strong>
              <span class="text-sm text-slate-500">{{
                teknisi.username
              }}</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div
              class="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg hidden sm:block uppercase tracking-wider"
            >
              {{ teknisi.peran }}
            </div>
          </div>
        </li>

        <li
          v-if="daftarTeknisi.length === 0"
          class="p-8 text-center text-slate-400 text-sm font-medium"
        >
          Belum ada data teknisi yang terdaftar.
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const daftarTeknisi = ref([]);

const fetchData = async () => {
  try {
    const usersRes = await api.get("/auth/users?role=teknisi");
    daftarTeknisi.value = usersRes.data;
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
};

onMounted(() => {
  fetchData();
});
</script>
