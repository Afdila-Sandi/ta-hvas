<template>
  <div
    class="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-lg"
  >
    <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
      <div
        class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-black shadow-sm"
      >
        <i class="fa-solid fa-user-shield"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold text-slate-800">Profil Administrator</h2>
        <p class="text-xs text-slate-500 font-medium mt-0.5">
          Perbarui informasi kredensial Anda
        </p>
      </div>
    </div>

    <form @submit.prevent="updateAdminProfile" class="space-y-5">
      <div
        v-if="pesan"
        :class="
          isError
            ? 'bg-rose-50 text-rose-600'
            : 'bg-emerald-50 text-emerald-600'
        "
        class="p-3 rounded-xl text-xs font-bold text-center"
      >
        {{ pesan }}
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 mb-1.5 ml-1"
          >Nama Lengkap</label
        >
        <input
          v-model="form.nama"
          type="text"
          required
          class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 transition-all"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 mb-1.5 ml-1"
          >Username</label
        >
        <input
          v-model="form.username"
          type="text"
          required
          class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 transition-all"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 mb-1.5 ml-1"
          >Kata Sandi Baru
          <span class="text-[10px] font-normal text-slate-400"
            >(Kosongkan jika tak diubah)</span
          ></label
        >
        <input
          v-model="form.newPassword"
          type="password"
          placeholder="Minimal 6 Karakter"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 transition-all"
        />
      </div>

      <button
        type="submit"
        :disabled="isUpdating"
        class="w-full mt-2 py-3.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 shadow-md"
      >
        {{ isUpdating ? "Menyimpan Perubahan..." : "Simpan Profil" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../services/api";

const form = reactive({ nama: "", username: "", newPassword: "" });
const isUpdating = ref(false);
const pesan = ref("");
const isError = ref(false);

const fetchData = async () => {
  try {
    const res = await api.get("/auth/profile");
    form.nama = res.data.nama;
    form.username = res.data.username;
  } catch (err) {
    pesan.value = "Gagal memuat data awal.";
    isError.value = true;
  }
};

const updateAdminProfile = async () => {
  isUpdating.value = true;
  pesan.value = "";

  if (form.newPassword && form.newPassword.length < 6) {
    pesan.value = "Kata sandi minimal 6 karakter!";
    isError.value = true;
    isUpdating.value = false;
    return;
  }

  try {
    // Memanggil API yang sama seperti teknisi untuk update profil
    await api.put("/auth/profile", form);

    isError.value = false;
    pesan.value = "Profil berhasil diperbarui!";
    form.newPassword = ""; 

    // Refresh halaman setelah 1.5 detik agar nama di pojok kiri atas ikut berubah
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (err) {
    isError.value = true;
    pesan.value = err.response?.data?.message || "Gagal memperbarui profil";
  } finally {
    isUpdating.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
