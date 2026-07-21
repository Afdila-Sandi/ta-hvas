<template>
  <div class="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Edit Data Teknisi</h2>
          <p class="text-xs text-slate-500 mt-1">
            Perbarui informasi akun lapangan
          </p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-rose-500 transition-colors">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div v-if="message" :class="isError ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'" class="mb-4 p-3 rounded-lg text-sm text-center font-medium">
        {{ message }}
      </div>

      <form @submit.prevent="handleEdit" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
          <input
            v-model="form.nama"
            type="text"
            required
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Username</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Kata Sandi Baru <span class="text-xs text-slate-400 font-normal">(Opsional)</span></label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Kosongkan jika tidak ingin diubah"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Peran</label>
          <select v-model="form.peran" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white">
            <option value="teknisi">Teknisi</option>
            <option value="penyelia">Penyelia</option>
          </select>
        </div>

        <div class="flex gap-3 mt-8">
          <button type="button" @click="$emit('close')" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors active:scale-95">
            Batal
          </button>
          <button type="submit" :disabled="isLoading" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all disabled:bg-emerald-400 active:scale-95 shadow-sm">
            <span v-if="!isLoading">Simpan Perubahan</span>
            <span v-else>Memproses...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../services/api";

const props = defineProps({
  userData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["close", "success"]);

const isLoading = ref(false);
const message = ref("");
const isError = ref(false);

const form = reactive({
  id: null,
  nama: "",
  username: "",
  password: "", // Dibiarkan kosong, hanya diisi jika ingin diubah
  peran: "teknisi",
});

// Masukkan data lama ke dalam form saat modal dibuka
onMounted(() => {
  if (props.userData) {
    form.id = props.userData.id;
    form.nama = props.userData.nama;
    form.username = props.userData.username;
    form.peran = props.userData.peran;
  }
});

const handleEdit = async () => {
  isLoading.value = true;
  message.value = "";

  try {
    await api.put(`/auth/users/${form.id}`, {
      username: form.username,
      nama: form.nama,
      peran: form.peran,
      password: form.password // Akan dikirim string kosong jika tidak diisi
    });

    isError.value = false;
    message.value = "Data berhasil diperbarui!";
    
    setTimeout(() => { emit("success"); }, 1000);
  } catch (error) {
    isError.value = true;
    message.value = error.response?.data?.message || "Gagal memperbarui pengguna.";
  } finally {
    isLoading.value = false;
  }
};
</script>