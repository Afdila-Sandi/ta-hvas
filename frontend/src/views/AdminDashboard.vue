<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="logo">
        <h2>AirLab Control <span class="badge">ADMIN</span></h2>
        <p>Sistem Pemantauan HVAS - BSPJI Padang</p>
      </div>
      <div class="user-profile">
        <div class="avatar">AS</div>
        <div class="user-info">
          <span class="name">Afdila Sandi</span>
          <span class="role">Administrator</span>
        </div>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </header>

    <main class="dashboard-content">
      <section class="stats-grid">
        <div class="stat-card">
          <h3>Status Sistem</h3>
          <div class="stat-value text-green">ONLINE</div>
          <p>Microservices Gateway Aktif</p>
        </div>
        <div class="stat-card">
          <h3>Suhu Rata-rata (Lab Udara)</h3>
          <div class="stat-value">{{ rataRataSuhu }}°C</div>
          <p>Batas Aman: 28°C</p>
        </div>
        <div class="stat-card">
          <h3>Total Teknisi Aktif</h3>
          <div class="stat-value">{{ daftarTeknisi.length }} Akun</div>
          <p>Memiliki akses kontrol lapangan</p>
        </div>
      </section>

      <div class="main-grid">
        <section class="panel activity-log">
          <div class="panel-header">
            <h3>Riwayat Aktivitas Kontrol (Audit Trail)</h3>
            <button @click="fetchLogs" class="btn-refresh">Refresh Data</button>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Pengguna (Role)</th>
                  <th>Aksi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(log, index) in riwayatAktivitas" :key="index">
                  <td>{{ formatWaktu(log.timestamp) }}</td>
                  <td>
                    <strong>{{ log.username }}</strong>
                    <span class="role-badge">{{ log.role }}</span>
                  </td>
                  <td>{{ log.action }}</td>
                  <td>
                    <span :class="['status-badge', log.status.toLowerCase()]">
                      {{ log.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="riwayatAktivitas.length === 0">
                  <td colspan="4" class="text-center">
                    Tidak ada aktivitas terbaru.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel user-management">
          <div class="panel-header">
            <h3>Daftar Teknisi Lapangan</h3>
            <button @click="isModalOpen = true" class="btn-primary">
              + Tambah Teknisi
            </button>
          </div>
          <ul class="user-list">
            <li v-for="teknisi in daftarTeknisi" :key="teknisi.id">
              <div class="user-detail">
                <strong>{{ teknisi.nama }}</strong> ({{ teknisi.username }})
              </div>
              <div class="user-status text-green">Aktif</div>
            </li>
          </ul>
        </section>
      </div>
    </main>

    <AddUserModal
      v-if="isModalOpen"
      @close="isModalOpen = false"
      @success="handleUserAdded"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AddUserModal from "../components/AddUserModal.vue";
// import api from '../services/api'; // Pastikan Axios/API service Anda di-import di sini

const router = useRouter();

// State Modal
const isModalOpen = ref(false);

// State Data
const rataRataSuhu = ref(24.5);
const riwayatAktivitas = ref([]);
const daftarTeknisi = ref([
  { id: 1, nama: "Teknisi Lab 01", username: "teknisi_01" },
  { id: 2, nama: "Teknisi Lab 02", username: "teknisi_02" },
]);

// Fungsi menangani sukses registrasi dari modal
const handleUserAdded = () => {
  isModalOpen.value = false;
  alert("Akun teknisi baru berhasil ditambahkan!");
  // Opsional: fetchTeknisi() di sini jika API sudah siap untuk me-refresh daftar
};

// Fungsi untuk mengambil data log dari Backend
const fetchLogs = async () => {
  try {
    // MOCK DATA untuk demonstrasi UI
    riwayatAktivitas.value = [
      {
        timestamp: new Date(),
        username: "teknisi_01",
        role: "Teknisi",
        action: "Mengaktifkan Siklus (180s/60s)",
        status: "SUCCESS",
      },
      {
        timestamp: new Date(Date.now() - 3600000),
        username: "teknisi_02",
        role: "Teknisi",
        action: "Mematikan Pompa (Manual)",
        status: "SUCCESS",
      },
      {
        timestamp: new Date(Date.now() - 7200000),
        username: "Afdila Sandi",
        role: "Admin",
        action: "Login ke Sistem",
        status: "SUCCESS",
      },
      {
        timestamp: new Date(Date.now() - 86400000),
        username: "teknisi_01",
        role: "Teknisi",
        action: "Mengaktifkan Pompa (Manual)",
        status: "FAILED",
      },
    ];
  } catch (error) {
    console.error("Gagal mengambil data riwayat:", error);
  }
};

// Format tampilan tanggal/waktu
const formatWaktu = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const handleLogout = () => {
  localStorage.removeItem("hvas_jwt_token");
  localStorage.removeItem("role");
  router.push("/login");
};

// Panggil fetch data saat komponen dimuat
onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
/* Reset & Base */
.admin-dashboard {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8fafc; /* Slate-50 */
  min-height: 100vh;
  color: #334155;
}

/* Header Styling: Menggunakan Emerald-900 (Hijau Gelap) */
.dashboard-header {
  background-color: #064e3b;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(6, 78, 59, 0.2);
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo p {
  margin: 0;
  font-size: 0.85rem;
  color: #a7f3d0; /* Emerald-200 */
}
.badge {
  background: #059669; /* Emerald-600 */
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 12px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
}
.avatar {
  background-color: #059669; /* Emerald-600 */
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.role {
  font-size: 0.8rem;
  color: #d1fae5;
}
.btn-logout {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-logout:hover {
  background: #dc2626;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border-top: 4px solid #059669; /* Emerald-600 */
}
.stat-card h3 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #64748b;
}
.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #065f46; /* Emerald-800 */
}
.text-green {
  color: #059669; /* Emerald-600 */
}

/* Panels */
.panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}
.btn-refresh,
.btn-primary {
  background: #059669; /* Emerald-600 */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-refresh:hover,
.btn-primary:hover {
  background: #047857; /* Emerald-700 */
}

/* Table Styling */
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
th {
  padding: 12px;
  background-color: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
}
td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.role-badge {
  font-size: 0.75rem;
  background: #d1fae5; /* Emerald-100 */
  color: #065f46; /* Emerald-800 */
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 5px;
}

/* Status Badges */
.status-badge.success {
  background-color: #d1fae5; /* Emerald-100 */
  color: #065f46;
}
.status-badge.failed {
  background-color: #fee2e2;
  color: #991b1b;
}

/* User List */
.user-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: #059669; /* Emerald-600 */
}
</style>
