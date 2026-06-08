<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 overflow-hidden"
    >
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-slate-800">Tambah Akun Baru</h1>
        <p class="text-sm text-slate-500 mt-1">
          Registrasi Teknisi / Admin BSPJI
        </p>
      </div>

      <div
        v-if="message"
        :class="
          isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        "
        class="mb-4 p-3 rounded-lg text-sm text-center"
      >
        {{ message }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Nama Lengkap</label
          >
          <input
            v-model="form.nama"
            type="text"
            required
            placeholder="Afdila Sandi"
            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Username</label
          >
          <input
            v-model="form.username"
            type="text"
            required
            placeholder="sandi_admin"
            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Kata Sandi</label
          >
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Peran Akses</label
          >
          <select
            v-model="form.peran"
            required
            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="teknisi">Teknisi Lapangan</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-lg mt-2 transition-colors flex justify-center disabled:bg-slate-400"
        >
          <span v-if="!isLoading">Daftarkan Akun</span>
          <span v-else>Memproses...</span>
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?
        <router-link
          to="/login"
          class="text-blue-600 hover:underline font-semibold"
          >Kembali ke Login</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const isLoading = ref(false);
const message = ref("");
const isError = ref(false);

const form = reactive({
  nama: "",
  username: "",
  password: "",
  peran: "teknisi", 
});

const handleRegister = async () => {
  isLoading.value = true;
  message.value = "";

  const result = await authStore.register(
    form.username,
    form.password,
    form.nama,
    form.peran,
  );

  isError.value = !result.success;
  message.value = result.message;

  if (result.success) {
    form.nama = "";
    form.username = "";
    form.password = "";
    form.peran = "teknisi";
  }

  isLoading.value = false;
};
</script>
