const WebSocket = require("ws");
const mqtt = require("mqtt");
const jwt = require("jsonwebtoken");

exports.initControlService = (server, app) => {
  const SECRET_KEY = process.env.JWT_SECRET;
  const MQTT_BROKER = process.env.MQTT_BROKER;
  const mqttClient = mqtt.connect(MQTT_BROKER);
  const wss = new WebSocket.Server({ server, path: "/ws/control" });

  // Memori sementara agar saat web di-refresh, status terakhir langsung muncul
  let latestStatus = {
    status_pompa: "OFF",
    mode: "MANUAL",
    sisa_waktu: 0,
    cycle_phase: null,
  };

  mqttClient.on("connect", () => {
    console.log("Control Service terhubung ke Broker MQTT");
    mqttClient.subscribe("esp/data"); // Mendengarkan laporan dari ESP32
  });

  // MENANGKAP LAPORAN DARI ESP32 (Setiap 5 detik)
  mqttClient.on("message", (topic, message) => {
    try {
      const data = JSON.parse(message.toString());

      // Jika di dalam payload ada data pompa, perbarui status
      if (data.status_pompa) {
        latestStatus.status_pompa = data.status_pompa;
        latestStatus.mode = data.mode || "MANUAL";
        latestStatus.sisa_waktu = data.sisa_waktu || 0;
        latestStatus.cycle_phase = data.cycle_phase || null;

        // Siarkan status terbaru ini ke semua browser (web) yang sedang terbuka
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ ...latestStatus, type: "status_update" }),
            );
          }
        });
      }
    } catch (err) {
      // Abaikan jika bukan JSON
    }
  });

  // MENERIMA PERINTAH DARI WEB DAN MELEMPAR KE ESP32
  if (app) {
    app.post("/", (req, res) => {
      // 1. Verifikasi Keamanan JWT
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ success: false, message: "Token JWT tidak ada." });
      }

      const token = authHeader.split(" ")[1];
      let decoded;
      try {
        decoded = jwt.verify(token, SECRET_KEY);
      } catch (jwtErr) {
        return res
          .status(401)
          .json({ success: false, message: "Token JWT tidak valid." });
      }

      if (decoded.role !== "teknisi") {
        return res
          .status(403)
          .json({ success: false, message: "Akses ditolak." });
      }

      // 2. Baca Perintah dari Web
      const { action, durasi_on, durasi_off, durasi } = req.body;
      let payloadKeESP = {};

      // 3. Ubah format perintah menjadi JSON sederhana untuk ESP32
      if (action === "ON" || action === "OFF") {
        payloadKeESP = { cmd: action };
      } else if (action === "CYCLE") {
        if (!durasi_on || !durasi_off) {
          return res
            .status(400)
            .json({ success: false, message: "Durasi siklus tidak valid." });
        }
        payloadKeESP = {
          cmd: "CYCLE",
          on: parseInt(durasi_on),
          off: parseInt(durasi_off),
        };
      } else if (action === "TIMER") {
        if (!durasi) {
          return res
            .status(400)
            .json({ success: false, message: "Durasi timer tidak valid." });
        }
        payloadKeESP = { cmd: "TIMER", durasi: parseInt(durasi) }; // Durasi dalam menit
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Aksi tidak valid." });
      }

      // 4. Tembakkan perintah tersebut ke ESP32 via MQTT
      mqttClient.publish("esp/pompa/kontrol", JSON.stringify(payloadKeESP));

      return res
        .status(200)
        .json({
          success: true,
          message: `Perintah ${action} diteruskan ke alat.`,
        });
    });
  }

  // JIKA ADA WEB YANG BARU DIBUKA (REFRESH), KIRIM STATUS TERAKHIR
  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ ...latestStatus, type: "initial_status" }));
  });
};
