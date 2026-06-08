import { ref } from "vue";

export const wsStatus = ref("Menghubungkan...");
export const isConnected = ref(false);
export const timerEndTime = ref(null);
export const cyclePhase = ref(null); 
export const sensorData = ref({
  suhu_bme: 0.0,
  kelembaban_bme: 0.0,
  tekanan: 0,
  suhu_dht: 0.0,
  kelembaban_dht: 0.0,
  kebisingan: 0,
  status_pompa: "MEMUAT...",
});

let ws;

export function initWebSocket() {
  const isDev = import.meta.env.DEV;
  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const host = window.location.host;

  const wsURL = isDev
    ? "wss://34.236.213.248/ws/monitor"
    : `${protocol}${host}/ws/monitor`;

  ws = new WebSocket(wsURL);

  ws.onopen = () => {
    wsStatus.value = "Terhubung";
    isConnected.value = true;
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "realtime_data") {
      sensorData.value.suhu_bme = data.suhu_bme;
      sensorData.value.kelembaban_bme = data.kelembaban_bme;
      sensorData.value.tekanan = data.tekanan;
      sensorData.value.suhu_dht = data.suhu_dht;
      sensorData.value.kelembaban_dht = data.kelembaban_dht;
      sensorData.value.kebisingan = data.kebisingan;
      if (!timerEndTime.value)
        sensorData.value.status_pompa = data.status_pompa;
    } else if (
      data.type === "status_update" ||
      data.type === "initial_status"
    ) {
      sensorData.value.status_pompa = data.status_pompa;
      timerEndTime.value = data.timer_end_time;
      cyclePhase.value = data.cycle_phase; 
    }
  };

  ws.onclose = () => {
    wsStatus.value = "Terputus...";
    isConnected.value = false;
    setTimeout(initWebSocket, 2000);
  };
}

export function closeWebSocket() {
  if (ws) ws.close();
}
