<template>
  <div class="min-h-screen bg-slate-100 flex justify-center font-sans">
    <div
      class="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl flex flex-col"
    >
      <header
        class="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-4 flex justify-between items-center rounded-b-3xl shadow-sm"
      >
        <div>
          <h1 class="text-xl font-extrabold text-slate-800 tracking-tight">
            AirLab Control
          </h1>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="relative flex h-2.5 w-2.5">
              <span
                v-if="isConnected"
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2.5 w-2.5"
                :class="isConnected ? 'bg-emerald-500' : 'bg-red-500'"
              ></span>
            </span>
            <span
              class="text-xs font-semibold"
              :class="isConnected ? 'text-emerald-600' : 'text-red-500'"
            >
              {{ isConnected ? "Sistem Terhubung" : "Koneksi Terputus" }}
            </span>
          </div>
        </div>

        <img
          src="../assets/logo-bspji.png"
          alt="Logo"
          class="w-8 h-8 object-contain opacity-80"
        />
      </header>

      <main class="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        <component :is="currentComponent" />
      </main>

      <div class="fixed bottom-0 w-full max-w-md z-50">
        <nav
          class="bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl px-6 py-3"
        >
          <ul class="flex justify-between items-center">
            <li>
              <button
                @click="activeMenu = 'kontrol'"
                class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
              >
                <i
                  class="fa-solid fa-sliders text-xl"
                  :class="
                    activeMenu === 'kontrol'
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                  "
                ></i>
                <span
                  class="text-[10px] font-bold"
                  :class="
                    activeMenu === 'kontrol'
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  "
                  >Kontrol</span
                >
              </button>
            </li>

            <li>
              <button
                @click="activeMenu = 'riwayat'"
                class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
              >
                <i
                  class="fa-solid fa-chart-area text-xl"
                  :class="
                    activeMenu === 'riwayat'
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                  "
                ></i>
                <span
                  class="text-[10px] font-bold"
                  :class="
                    activeMenu === 'riwayat'
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  "
                  >Riwayat</span
                >
              </button>
            </li>

            <li>
              <button
                @click="activeMenu = 'setelan'"
                class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
              >
                <i
                  class="fa-solid fa-user-gear text-xl"
                  :class="
                    activeMenu === 'setelan'
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                  "
                ></i>
                <span
                  class="text-[10px] font-bold"
                  :class="
                    activeMenu === 'setelan'
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  "
                  >Setelan</span
                >
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { initWebSocket, closeWebSocket, isConnected } from "../services/ws";

// Import komponen child
import TeknisiKontrol from "../components/TeknisiKontrol.vue";
import TeknisiRiwayat from "../components/TeknisiRiwayat.vue";
import TeknisiSetelan from "../components/TeknisiSetelan.vue";

// State Menu Aktif
const activeMenu = ref("kontrol");

// Logika Dynamic Component
const currentComponent = computed(() => {
  switch (activeMenu.value) {
    case "riwayat":
      return TeknisiRiwayat;
    case "setelan":
      return TeknisiSetelan;
    default:
      return TeknisiKontrol;
  }
});

// WebSocket diinisialisasi secara global di kerangka utama
onMounted(() => {
  initWebSocket();
});

onUnmounted(() => {
  closeWebSocket();
});
</script>

<style scoped>
main::-webkit-scrollbar {
  display: none;
}
main {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
