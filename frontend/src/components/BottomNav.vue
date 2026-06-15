<template>
  <div class="fixed bottom-0 w-full max-w-md z-50">
    <nav
      class="bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl px-6 py-3"
    >
      <ul class="flex justify-between items-center">
        <li>
          <router-link
            to="/dashboard"
            class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
            active-class="text-emerald-500"
            exact-active-class="text-emerald-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              :class="
                $route.path === '/dashboard'
                  ? 'fill-emerald-100 stroke-emerald-500'
                  : 'fill-none stroke-slate-400'
              "
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <span
              class="text-[10px] font-bold"
              :class="
                $route.path === '/dashboard'
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              "
              >Kontrol</span
            >
          </router-link>
        </li>

        <li>
          <router-link
            to="/riwayat"
            class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
            active-class="text-emerald-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              :class="
                $route.path === '/riwayat'
                  ? 'fill-emerald-100 stroke-emerald-500'
                  : 'fill-none stroke-slate-400'
              "
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span
              class="text-[10px] font-bold"
              :class="
                $route.path === '/riwayat'
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              "
              >Riwayat</span
            >
          </router-link>
        </li>

        <li>
          <router-link
            to="/pengaturan"
            class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
            active-class="text-emerald-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              :class="
                $route.path === '/pengaturan'
                  ? 'fill-emerald-100 stroke-emerald-500'
                  : 'fill-none stroke-slate-400'
              "
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span
              class="text-[10px] font-bold"
              :class="
                $route.path === '/pengaturan'
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              "
              >Setelan</span
            >
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>
<script setup></script>
