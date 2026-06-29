<template>
  <div class="space-y-6">
    <div
      class="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
    >
      <div
        class="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl"
      ></div>
      <div
        class="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-50 rounded-full blur-2xl"
      ></div>

      <div
        class="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-black mb-4 border-4 border-white shadow-md uppercase relative z-10"
      >
        {{ (userName || "TK").substring(0, 2) }}
      </div>
      <h2 class="text-xl font-bold text-slate-800 capitalize relative z-10">
        {{ userName || "Memuat..." }}
      </h2>
      <p
        class="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1 relative z-10"
      >
        {{ userRole || "Teknisi" }}
      </p>
    </div>

    <div
      class="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden"
    >
      <div>
        <button
          @click="toggleEditForm"
          class="w-full p-5 flex items-center justify-between text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"
            >
              <i class="fa-solid fa-user-pen text-xs"></i>
            </div>
            <span class="font-bold">Edit Profil & Sandi</span>
          </div>
          <i
            class="fa-solid fa-chevron-down text-xs text-slate-400 transition-transform duration-300"
            :class="{ 'rotate-180': isFormOpen }"
          ></i>
        </button>

        <div
          v-if="isFormOpen"
          class="px-5 pb-5 pt-2 border-t border-slate-50 bg-slate-50/50"
        >
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div
              v-if="formMessage"
              :class="
                isError
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-emerald-600 bg-emerald-50'
              "
              class="p-3 rounded-xl text-xs font-bold text-center"
            >
              {{ formMessage }}
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1 ml-1"
                >Nama Lengkap</label
              >
              <input
                v-model="profileForm.nama"
                type="text"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium bg-white"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1 ml-1"
                >Username</label
              >
              <input
                v-model="profileForm.username"
                type="text"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium bg-white"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1 ml-1"
                >Kata Sandi Baru
                <span class="text-[10px] font-normal text-slate-400"
                  >(Kosongkan jika tak diubah)</span
                ></label
              >
              <input
                v-model="profileForm.newPassword"
                type="password"
                placeholder="Minimal 6 karakter"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium bg-white"
              />
            </div>

            <button
              type="submit"
              :disabled="isUpdating"
              class="w-full py-3 mt-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-md"
            >
              {{ isUpdating ? "Menyimpan..." : "Simpan Perubahan" }}
            </button>
          </form>
        </div>
      </div>

      <div class="h-px w-full bg-slate-50"></div>
    </div>

    <button
      @click="handleLogout"
      class="w-full py-4 mt-8 bg-white text-rose-500 font-bold rounded-3xl border-2 border-rose-100 hover:bg-rose-50 active:scale-95 transition-all shadow-[0_4px_20px_rgb(225,29,72,0.05)] flex items-center justify-center gap-2"
    >
      <i class="fa-solid fa-arrow-right-from-bracket"></i>
      Keluar dari Sistem
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import { closeWebSocket } from "../services/ws";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const userName = ref("");
const userRole = ref("");

// State untuk Form Profil
const isFormOpen = ref(false);
const isUpdating = ref(false);
const formMessage = ref("");
const isError = ref(false);

const profileForm = reactive({
  nama: "",
  username: "",
  newPassword: "",
});

const fetchProfile = async () => {
  try {
    const response = await api.get("/auth/profile");
    userName.value = response.data.nama;
    userRole.value = response.data.peran;

    // Isi form dengan data saat ini
    profileForm.nama = response.data.nama;
    profileForm.username = response.data.username;
  } catch (error) {
    userName.value = "Teknisi Lapangan";
  }
};

const toggleEditForm = () => {
  isFormOpen.value = !isFormOpen.value;
  formMessage.value = ""; // Bersihkan pesan error saat dibuka/tutup
};

const updateProfile = async () => {
  isUpdating.value = true;
  formMessage.value = "";

  try {
    const response = await api.put("/auth/profile", {
      nama: profileForm.nama,
      username: profileForm.username,
      newPassword: profileForm.newPassword,
    });

    isError.value = false;
    formMessage.value = "Profil berhasil diperbarui!";

    // Perbarui nama di kartu profil atas
    userName.value = response.data.user.nama;
    profileForm.newPassword = ""; 
    setTimeout(() => {
      isFormOpen.value = false;
      formMessage.value = "";
    }, 2000);
  } catch (error) {
    isError.value = true;
    formMessage.value =
      error.response?.data?.message || "Gagal memperbarui profil.";
  } finally {
    isUpdating.value = false;
  }
};

const handleLogout = async () => {
  if (confirm("Yakin ingin keluar?")) {
    closeWebSocket();
    await authStore.logout();
    router.push("/login");
  }
};

onMounted(() => {
  fetchProfile();
});
</script>
