<template>
  <aside
    class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-20 h-screen sticky top-0"
  >
    <div class="p-6 border-b border-slate-100 flex items-center gap-3">
      <img
        src="../assets/logo-bspji.png"
        alt="Logo BSPJI"
        class="w-12 h-12 object-contain drop-shadow-sm"
      />
      <div>
        <h2
          class="text-sm font-extrabold text-slate-800 tracking-widest uppercase"
        >
          AirLab
        </h2>
        <p
          class="text-[10px] text-emerald-600 uppercase font-bold tracking-wider"
        >
          Admin Panel
        </p>
      </div>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <button
        v-for="menu in menuItems"
        :key="menu.id"
        @click="$emit('changeMenu', menu.id)"
        class="group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300"
        :class="
          activeMenu === menu.id
            ? 'bg-emerald-50 text-emerald-700 shadow-sm'
            : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        "
      >
        <i
          :class="[
            menu.icon,
            activeMenu === menu.id
              ? 'text-emerald-600'
              : 'text-slate-400 group-hover:text-slate-500',
          ]"
          class="text-lg w-6 text-center transition-colors"
        ></i>
        <span :class="{ 'font-bold': activeMenu === menu.id }">{{
          menu.label
        }}</span>
      </button>
    </nav>

    <div class="p-6 border-t border-slate-100 bg-slate-50/50">
      <div
        class="flex items-center gap-3 mb-5 cursor-pointer hover:opacity-75 transition-opacity"
        @click="$emit('changeMenu', 'profil')"
      >
        <div
          class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-700 font-black border border-slate-200 shadow-sm uppercase shrink-0"
        >
          {{ (userName || "AD").substring(0, 2) }}
        </div>
        <div class="overflow-hidden">
          <p class="text-sm font-bold text-slate-800 capitalize truncate">
            {{ userName || "Memuat..." }}
          </p>
          <p
            class="text-[10px] uppercase tracking-wider text-slate-500 font-bold truncate"
          >
            {{ userRole || "ADMIN" }}
          </p>
        </div>
      </div>

      <button
        @click="$emit('logout')"
        class="w-full flex justify-center items-center gap-2 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-xl transition-all active:scale-95 shadow-sm"
      >
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Keluar
      </button>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  activeMenu: { type: String, default: "dashboard" },
  userName: { type: String, default: "" },
  userRole: { type: String, default: "" },
});

const emit = defineEmits(["changeMenu", "logout"]);

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-chart-line" },
  { id: "user", label: "Data Teknisi", icon: "fa-solid fa-users-gear" },
  { id: "laporan", label: "Laporan Audit", icon: "fa-solid fa-file-contract" },
];
</script>
