<template>
  <div
    class="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden"
    >
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Tambah Teknisi Baru</h2>
          <p class="text-xs text-slate-500 mt-1">
            Buat akun untuk akses kontrol lapangan
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-red-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
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
            placeholder="Contoh: Budi Santoso"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
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
            placeholder="teknisi_budi"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Kata Sandi Default</label
          >
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1"
            >Peran</label
          >
          <select
            v-model="form.peran"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
          >
            <option value="teknisi">Teknisi</option>
            <option value="penyelia">Penyelia</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:bg-emerald-400"
          >
            <span v-if="!isLoading">Simpan Akun</span>
            <span v-else>Memproses...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import api from "../services/api"; // Ganti authStore dengan api langsung

const emit = defineEmits(["close", "success"]);

const isLoading = ref(false);
const message = ref("");
const isError = ref(false);

const form = reactive({
  nama: "",
  username: "",
  password: "",
  peran: "",
});

const handleRegister = async () => {
  isLoading.value = true;
  message.value = "";

  try {
    // Tembak API secara langsung tanpa menggunakan Store
    const response = await api.post("/auth/register", {
      username: form.username,
      password: form.password,
      nama: form.nama,
      peran: form.peran,
    });

    isError.value = false;
    message.value = response.data.message || "Berhasil menambahkan akun!";

    // Bersihkan form
    form.nama = "";
    form.username = "";
    form.password = "";
    form.peran = "";

    // Beri jeda sedikit agar user bisa membaca pesan sukses, lalu tutup modal
    setTimeout(() => {
      emit("success");
    }, 1500);
  } catch (error) {
    isError.value = true;
    // Tangkap pesan error dari backend jika username sudah ada
    message.value =
      error.response?.data?.message || "Gagal menambahkan pengguna.";
  } finally {
    isLoading.value = false;
  }
};
</script>
