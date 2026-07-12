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
        <component
          :is="currentComponent"
          v-if="hasActiveSession"
          @session-created="cekSesiAktif"
        />
        <TeknisiSamplingForm
          v-else
          :blockedByOther="blockedByOther"
          :otherSession="otherSession"
          @session-created="cekSesiAktif"
        />
      </main>

      <div v-if="hasActiveSession" class="fixed bottom-0 w-full max-w-md z-50">
        <nav
          class="bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl px-6 py-3"
        >
          <ul class="flex justify-between items-center">
            <li>
              <button
                @click="activeMenu = 'kontrol'"
                :disabled="blockedByOther"
                class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                :class="blockedByOther ? 'opacity-40 cursor-not-allowed' : ''"
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
                @click="activeMenu = 'tren'"
                class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
              >
                <i
                  class="fa-solid fa-chart-line text-xl"
                  :class="
                    activeMenu === 'tren'
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                  "
                ></i>
                <span
                  class="text-[10px] font-bold"
                  :class="
                    activeMenu === 'tren'
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  "
                  >Tren Data</span
                >
              </button>
            </li>

            <li>
              <button
                @click="activeMenu = 'laporan'"
                class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
              >
                <i
                  class="fa-solid fa-file-lines text-xl"
                  :class="
                    activeMenu === 'laporan'
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                  "
                ></i>
                <span
                  class="text-[10px] font-bold"
                  :class="
                    activeMenu === 'laporan'
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  "
                  >Laporan</span
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
import api from "../services/api";

import TeknisiKontrol from "../components/TeknisiKontrol.vue";
import TeknisiTren from "../components/TeknisiRiwayat.vue";
import TeknisiSetelan from "../components/TeknisiSetelan.vue";
import TeknisiLaporan from "../components/TeknisiLaporan.vue";
import TeknisiSamplingForm from "../components/TeknisiSamplingForm.vue";

const activeMenu = ref("kontrol");
const hasActiveSession = ref(false);
const blockedByOther = ref(false);
const otherSession = ref(null);

const cekSesiAktif = async () => {
  try {
    const res = await api.get("/telemetry/sampling/active-session");
    hasActiveSession.value = res.data.active;
    blockedByOther.value = res.data.blocked_by_other;
    otherSession.value = res.data.other_session;
    if (!hasActiveSession.value && activeMenu.value === "kontrol") {
      activeMenu.value = "laporan";
    }
  } catch (error) {
    console.error("Gagal mengecek sesi aktif:", error);
    hasActiveSession.value = false;
    blockedByOther.value = false;
    otherSession.value = null;
    if (activeMenu.value === "kontrol") {
      activeMenu.value = "laporan";
    }
  }
};

const currentComponent = computed(() => {
  if (!hasActiveSession.value) {
    return TeknisiSamplingForm;
  }
  switch (activeMenu.value) {
    case "tren":
      return TeknisiTren;
    case "setelan":
      return TeknisiSetelan;
    case "laporan":
      return TeknisiLaporan;
    default:
      return TeknisiKontrol;
  }
});

onMounted(() => {
  initWebSocket();
  cekSesiAktif();
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
