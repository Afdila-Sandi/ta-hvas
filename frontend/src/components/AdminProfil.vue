<template>
  <div
    class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-lg"
  >
    <h2 class="text-xl font-bold text-slate-800 mb-6">Edit Profil Admin</h2>
    <form @submit.prevent="updateAdminProfile" class="space-y-4">
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1"
          >Nama Lengkap</label
        >
        <input
          v-model="form.nama"
          type="text"
          class="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1"
          >Username</label
        >
        <input
          v-model="form.username"
          type="text"
          class="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1"
          >Kata Sandi Baru</label
        >
        <input
          v-model="form.newPassword"
          type="password"
          placeholder="Kosongkan jika tidak ingin diubah"
          class="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <button
        :disabled="isUpdating"
        class="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
      >
        {{ isUpdating ? "Menyimpan..." : "Simpan Perubahan" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../services/api";

const form = reactive({ nama: "", username: "", newPassword: "" });
const isUpdating = ref(false);

const fetchData = async () => {
  const res = await api.get("/auth/profile");
  form.nama = res.data.nama;
  form.username = res.data.username;
};

const updateAdminProfile = async () => {
  isUpdating.value = true;
  try {
    await api.put("/auth/profile", form);
    alert("Profil berhasil diperbarui!");
  } catch (err) {
    alert("Gagal update profil");
  } finally {
    isUpdating.value = false;
  }
};

onMounted(fetchData);
</script>
