<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 overflow-hidden"
    >
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-slate-800">AirLab Control</h1>
        <p class="text-sm text-slate-500 mt-1">
          Sistem Monitoring & Kontrol HVAS
        </p>
      </div>

      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-medium"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Username
          </label>
          <input
            v-model="form.username"
            type="text"
            required
            placeholder="masukkan username anda"
            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Kata Sandi
          </label>
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center disabled:bg-emerald-400 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Masuk</span>
          <span v-else class="flex items-center gap-2">
            <svg
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Memverifikasi...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const errorMessage = ref("");
const form = reactive({
  username: "",
  password: "",
});

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  const result = await authStore.login(form.username, form.password);

  if (result.success) {

    const userRole = localStorage.getItem("role") || authStore.userRole;

    if (userRole === "admin") {
      router.push("/admin");
    } else if (userRole === "teknisi") {
      router.push("/teknisi");
    } else {
      router.push("/teknisi");
    }
  } else {
    errorMessage.value =
      result.message ||
      "Gagal masuk. Periksa kembali username dan kata sandi Anda.";
  }

  isLoading.value = false;
};
</script>
