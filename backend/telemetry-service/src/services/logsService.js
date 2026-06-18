const mqtt = require("mqtt");
const WebSocket = require("ws");
const pool = require("../config/database");

exports.initSensorService = (wss) => {
  const MQTT_BROKER = process.env.MQTT_BROKER;
  const mqttClient = mqtt.connect(MQTT_BROKER);

  let latestSensorData = null;

  //konek mqtt
  mqttClient.on("connect", () => {
    console.log("Terhubung ke Broker MQTT");
    
    mqttClient.subscribe("esp/data/+");
  });

  mqttClient.on("message", (topic, message) => {

    const topicParts = topic.split("/");
    const tokenMasuk = topicParts[2]; 
    // Mengambil token asli dari file .env
    const TOKEN_RAHASIA = process.env.TOKEN_ESP;

    if (tokenMasuk !== TOKEN_RAHASIA) {
      console.warn(`[KEAMANAN] Data ditolak! Token tidak valid: ${tokenMasuk}`);
      return; 
    }

    // Jika token benar, proses berlanjut seperti biasa
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
      };

      //data realtime
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

  //menyimpan data ke db
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