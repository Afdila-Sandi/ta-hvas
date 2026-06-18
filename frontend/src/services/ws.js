import { ref } from "vue";

export const wsStatus = ref("Menghubungkan...");
export const isConnected = ref(false);

export const sensorData = ref({
  suhu_bme: 0.0,
  kelembaban_bme: 0.0,
  tekanan: 0,
  suhu_dht: 0.0,
  kelembaban_dht: 0.0,
  kebisingan: 0,
  status_pompa: "MEMUAT...",
  mode: "MANUAL",
  sisa_waktu: 0,
  cycle_phase: null,
});

let wsTelemetry = null;
let wsControl = null;

export function initWebSocket() {
  const isDev = import.meta.env.DEV;
  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const host = window.location.host;

  function connectTelemetry() {

    const wsTelemetryURL = isDev
      ? `${import.meta.env.VITE_WS_URL}/telemetry`
      : `${protocol}${host}/api/ws/telemetry`; 

    wsTelemetry = new WebSocket(wsTelemetryURL);

    wsTelemetry.onopen = () => {
      wsStatus.value = "Terhubung";
      isConnected.value = true;
      console.log("[WS Telemetry] Berhasil terhubung.");
    };

    wsTelemetry.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "realtime_data") {
          sensorData.value.suhu_bme = data.suhu_bme;
          sensorData.value.kelembaban_bme = data.kelembaban_bme;
          sensorData.value.tekanan = data.tekanan;
          sensorData.value.suhu_dht = data.suhu_dht;
          sensorData.value.kelembaban_dht = data.kelembaban_dht;
          sensorData.value.kebisingan = data.kebisingan;

          if (sensorData.value.mode === "MANUAL") {
            sensorData.value.status_pompa = data.status_pompa;
          }
        }
      } catch (err) {
        console.error("[WS Telemetry] Gagal membaca data:", err);
      }
    };

    wsTelemetry.onclose = () => {
      wsStatus.value = "Terputus...";
      isConnected.value = false;
      console.log(
        "[WS Telemetry] Terputus. Mencoba reconnect dalam 3 detik...",
      );
      setTimeout(connectTelemetry, 3000);
    };

    wsTelemetry.onerror = (err) => {
      console.error("[WS Telemetry] Terjadi Error Jaringan.");
    };
  }

  function connectControl() {

    const wsControlURL = isDev
      ? `${import.meta.env.VITE_WS_URL}/control`
      : `${protocol}${host}/api/ws/control`; 

    wsControl = new WebSocket(wsControlURL);

    wsControl.onopen = () => {
      console.log("[WS Control] Berhasil terhubung.");
    };

    wsControl.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WS Control] Data diterima:", data);

        if (data.type === "status_update" || data.type === "initial_status") {
          sensorData.value.status_pompa = data.status_pompa;
          sensorData.value.mode = data.mode || "MANUAL";
          sensorData.value.sisa_waktu = data.sisa_waktu || 0;
          sensorData.value.cycle_phase = data.cycle_phase || null;
        }
      } catch (err) {
        console.error("[WS Control] Gagal membaca data:", err);
      }
    };

    wsControl.onclose = () => {
      console.log("[WS Control] Terputus. Mencoba reconnect dalam 3 detik...");
      setTimeout(connectControl, 3000);
    };

    wsControl.onerror = (err) => {
      console.error("[WS Control] Terjadi Error Jaringan.");
    };
  }

  connectTelemetry();
  connectControl();
}

export function closeWebSocket() {
  if (wsTelemetry) {
    wsTelemetry.close();
    wsTelemetry = null;
  }
  if (wsControl) {
    wsControl.close();
    wsControl = null;
  }
}
