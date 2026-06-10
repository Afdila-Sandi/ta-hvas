<template>
  <aside
    class="w-64 bg-white border-r border-slate-200 flex flex-col z-20 h-screen sticky top-0"
  >
    <div class="p-6 border-b border-slate-100 flex items-center gap-3">
      <div
        class="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm"
      >
        <i class="fa-solid fa-leaf"></i>
      </div>
      <div>
        <h2
          class="text-sm font-extrabold text-slate-800 tracking-widest uppercase"
        >
          AirLab
        </h2>
        <p class="text-[10px] text-emerald-600 uppercase font-bold">
          Admin Panel
        </p>
      </div>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <button
        v-for="menu in menuItems"
        :key="menu.id"
        @click="$emit('changeMenu', menu.id)"
        :class="[
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all',
          activeMenu === menu.id
            ? 'bg-emerald-50 border border-emerald-500 text-emerald-800 shadow-sm'
            : 'bg-white border border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-200',
        ]"
      >
        <i :class="menu.icon" class="text-lg w-6 text-center"></i>
        <span>{{ menu.label }}</span>
      </button>
    </nav>

    <div class="p-6 border-t border-slate-100 bg-slate-50">
      <div class="flex items-center gap-3 mb-4">
        <div
          class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200 uppercase"
        >
          {{ userName.substring(0, 2) }}
        </div>
        <div class="overflow-hidden">
          <p class="text-sm font-bold text-slate-800 capitalize truncate">
            {{ userName }}
          </p>
          <p class="text-xs text-slate-500 capitalize truncate">
            {{ userRole }}
          </p>
        </div>
      </div>
      <button
        @click="$emit('logout')"
        class="w-full flex justify-center items-center gap-2 py-2.5 text-sm font-bold text-rose-500 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors"
      >
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Keluar
      </button>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  activeMenu: { type: String, default: "dashboard" },
  userName: { type: String, default: "Admin" },
  userRole: { type: String, default: "Administrator" },
});

const emit = defineEmits(["changeMenu", "logout"]);

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-chart-line" },
  { id: "user", label: "Data Teknisi", icon: "fa-solid fa-users-gear" },
  { id: "laporan", label: "Laporan Audit", icon: "fa-solid fa-file-contract" },
];
</script>
