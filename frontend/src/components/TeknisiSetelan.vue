<template>
  <div class="space-y-6">
    <div class="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center">
      <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-black mb-4 border-4 border-white shadow-md uppercase">
        {{ (userName || 'TK').substring(0, 2) }}
      </div>
      <h2 class="text-xl font-bold text-slate-800 capitalize">{{ userName || 'Memuat...' }}</h2>
      <p class="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">{{ userRole || 'Teknisi' }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-50 flex items-center justify-between text-sm text-slate-600 active:bg-slate-50 transition-colors">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-user-pen text-slate-400 w-5"></i>
          <span class="font-medium">Ubah Kata Sandi</span>
        </div>
        <i class="fa-solid fa-chevron-right text-xs text-slate-300"></i>
      </div>
      <div class="p-4 flex items-center justify-between text-sm text-slate-600 active:bg-slate-50 transition-colors">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-circle-info text-slate-400 w-5"></i>
          <span class="font-medium">Tentang Aplikasi</span>
        </div>
        <span class="text-xs text-slate-400 font-bold">v1.0.0</span>
      </div>
    </div>

    <button 
      @click="handleLogout"
      class="w-full py-4 mt-8 bg-white text-rose-500 font-bold rounded-2xl border border-rose-100 hover:bg-rose-50 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
    >
      <i class="fa-solid fa-arrow-right-from-bracket"></i>
      Keluar dari Sistem
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { closeWebSocket } from '../services/ws';

const router = useRouter();
const userName = ref('');
const userRole = ref('');

const fetchProfile = async () => {
  try {
    const response = await api.get("/auth/profile");
    userName.value = response.data.nama;
    userRole.value = response.data.peran;
  } catch (error) {
    console.error("Gagal memuat profil:", error);
    userName.value = "Teknisi Lapangan";
  }
};

const handleLogout = () => {
  if(confirm("Yakin ingin keluar?")) {
    localStorage.removeItem("hvas_jwt_token");
    localStorage.removeItem("role");
    closeWebSocket();
    router.push("/login");
  }
};

onMounted(() => {
  fetchProfile();
});
</script>