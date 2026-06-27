const mqtt = require("mqtt");
const WebSocket = require("ws");
const pool = require("../config/database");

const TOKEN_RAHASIA = process.env.TOKEN_ESP;

exports.initSensorService = (wss) => {
  const MQTT_BROKER = process.env.MQTT_BROKER;

  const mqttClient = mqtt.connect(MQTT_BROKER, {
    rejectUnauthorized: false,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    keepalive: 60,
  });

  let latestSensorData = null;

  mqttClient.on("error", (err) => {
    console.error("[FATAL] Gagal konek ke MQTT Broker:", err.message);
  });

  mqttClient.on("offline", () => {
    console.warn("[WARNING] MQTT Broker Offline atau Koneksi Ditolak!");
  });

  mqttClient.on("connect", () => {
    console.log("Terhubung ke Broker MQTT via Port 8000");
    mqttClient.subscribe("esp/data/+");
  });

  mqttClient.on("message", (topic, message) => {
    const topicParts = topic.split("/");
    const tokenMasuk = topicParts[2];

    if (tokenMasuk !== TOKEN_RAHASIA) {
      console.warn("[KEAMANAN] Data ditolak! Token tidak valid");
      return;
    }

    try {
      const data = JSON.parse(message.toString());
      latestSensorData = {
        waktu: data.waktu || new Date().toISOString(),
        suhu_bme: data.suhu_bme || 0.0,
        kelembaban_bme: data.kelembaban_bme || 0.0,
        tekanan: data.tekanan || 0.0,
        status_pompa: data.status_pompa || "OFF",
        suhu_dht: data.suhu_dht || 0.0,
        kelembaban_dht: data.kelembaban_dht || 0.0,
        kebisingan: data.kebisingan || 0.0,
        suhu_esp: data.suhu_esp || 0.0,
        status_kipas: data.status_kipas || "OFF",
        mode_kipas: data.mode_kipas || "AUTO",

        mode: data.mode || "MANUAL",
        cycle_phase: data.cycle_phase || "OFF",
        sisa_waktu: data.sisa_waktu || 0,
      };

      const realtimeData = { ...latestSensorData, type: "realtime_data" };
      const payload = JSON.stringify(realtimeData);

      wss.clients.forEach((wsClient) => {
        if (wsClient.readyState === WebSocket.OPEN) {
          wsClient.send(payload);
        }
      });
    } catch (err) {
      console.error("Format pesan MQTT tidak valid:", err.message);
    }
  });

  setInterval(
    async () => {
      if (!latestSensorData) return;

      let client;
      try {
        client = await pool.connect();
        const query = `
                INSERT INTO logs (waktu, suhu_bme, kelembaban_bme, tekanan, status_pompa, suhu_dht, kelembaban_dht, kebisingan)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            `;
        const values = [
          latestSensorData.waktu,
          latestSensorData.suhu_bme,
          latestSensorData.kelembaban_bme,
          latestSensorData.tekanan,
          latestSensorData.status_pompa,
          latestSensorData.suhu_dht,
          latestSensorData.kelembaban_dht,
          latestSensorData.kebisingan,
        ];
        await client.query(query, values);
        await client.query(
          "DELETE FROM logs WHERE waktu < NOW() - INTERVAL '30 days'",
        );
        console.log("Data sampling berhasil disimpan ke basis data");
      } catch (err) {
        console.error("Gagal menyimpan data ke basis data:", err.message);
      } finally {
        if (client) client.release();
      }
    },
    5 * 60 * 1000,
  );
};
