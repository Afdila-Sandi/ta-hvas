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

  suhu_esp: 0.0,
  status_kipas: "OFF",
  mode_kipas: "AUTO",
});

let wsTelemetry = null;
let wsControl = null;
let isIntentionalClose = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;

function getReconnectDelay() {
  const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000);
  return delay;
}

export function initWebSocket() {
  if (wsTelemetry && wsTelemetry.readyState === WebSocket.OPEN) return;

  const isDev = import.meta.env.DEV;
  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const host = window.location.host;

  isIntentionalClose = false;
  reconnectAttempts = 0;

  function connectTelemetry() {
    if (isIntentionalClose) return;

    const wsTelemetryURL = isDev
      ? `${import.meta.env.VITE_WS_URL}/api/ws/telemetry`
      : `${protocol}${host}/api/ws/telemetry`;

    wsTelemetry = new WebSocket(wsTelemetryURL);

    wsTelemetry.onopen = () => {
      wsStatus.value = "Terhubung";
      isConnected.value = true;
      reconnectAttempts = 0;
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

          sensorData.value.suhu_esp = data.suhu_esp;
          sensorData.value.status_kipas = data.status_kipas;
          sensorData.value.mode_kipas = data.mode_kipas;

          sensorData.value.status_pompa = data.status_pompa;
          sensorData.value.mode = data.mode;
          sensorData.value.cycle_phase = data.cycle_phase;
          sensorData.value.sisa_waktu = data.sisa_waktu;
        }
      } catch (err) {
        console.error("[WS Telemetry] Gagal membaca data:", err);
      }
    };

    wsTelemetry.onclose = () => {
      wsStatus.value = "Terputus...";
      isConnected.value = false;
      if (!isIntentionalClose && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = getReconnectDelay();
        reconnectAttempts++;
        setTimeout(connectTelemetry, delay);
      }
    };

    wsTelemetry.onerror = () => {};
  }

  function connectControl() {
    if (isIntentionalClose) return;

    const wsControlURL = isDev
      ? `${import.meta.env.VITE_WS_URL}/api/ws/control`
      : `${protocol}${host}/api/ws/control`;

    wsControl = new WebSocket(wsControlURL);

    wsControl.onopen = () => {};

    wsControl.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

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
      if (!isIntentionalClose && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = getReconnectDelay();
        setTimeout(connectControl, delay);
      }
    };

    wsControl.onerror = () => {};
  }

  connectTelemetry();
  connectControl();
}

export function closeWebSocket() {
  isIntentionalClose = true;
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS;

  if (wsTelemetry) {
    wsTelemetry.close();
    wsTelemetry = null;
  }
  if (wsControl) {
    wsControl.close();
    wsControl = null;
  }
  isConnected.value = false;
  wsStatus.value = "Terputus...";
}
