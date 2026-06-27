const WebSocket = require("ws");
const mqtt = require("mqtt");
const jwt = require("jsonwebtoken");

exports.initControlService = (server, app) => {
  const SECRET_KEY = process.env.JWT_SECRET;
  const MQTT_BROKER = process.env.MQTT_BROKER;

  const TOKEN_ESP = process.env.TOKEN_ESP;

  const mqttClient = mqtt.connect(MQTT_BROKER, {
    rejectUnauthorized: false,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    keepalive: 60,
  });

  const wss = new WebSocket.Server({ server, path: "/api/ws/control" });

  let latestStatus = {
    status_pompa: "OFF",
    mode: "MANUAL",
    sisa_waktu: 0,
    cycle_phase: null,
    status_kipas: "OFF",
    mode_kipas: "AUTO",
  };

  mqttClient.on("connect", () => {
    console.log("Control Service terhubung ke Broker MQTT");
    mqttClient.subscribe("esp/data/+");
  });

  mqttClient.on("message", (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.status_pompa !== undefined || data.status_kipas !== undefined) {
        latestStatus.status_pompa =
          data.status_pompa || latestStatus.status_pompa;
        latestStatus.mode = data.mode || latestStatus.mode;
        latestStatus.sisa_waktu = data.sisa_waktu || 0;
        latestStatus.cycle_phase = data.cycle_phase || null;
        latestStatus.status_kipas =
          data.status_kipas || latestStatus.status_kipas;
        latestStatus.mode_kipas = data.mode_kipas || latestStatus.mode_kipas;
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ ...latestStatus, type: "status_update" }),
            );
          }
        });
      }
    } catch (err) {
      console.error("[CONTROL] Gagal parse pesan MQTT:", err.message);
    }
  });

  if (app) {
    app.post("/", (req, res) => {
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

      const { action, durasi_on, durasi_off, target, mode } = req.body;
      let payloadKeESP = {};

      const allowedModes = ["AUTO", "MANUAL"];
      const allowedTargets = ["POMPA", "KIPAS"];

      if (action === "SET_MODE_KIPAS") {
        if (!mode || !allowedModes.includes(mode)) {
          return res.status(400).json({
            success: false,
            message: `Mode tidak valid. Pilihan: ${allowedModes.join(", ")}`,
          });
        }
        payloadKeESP = { action: "SET_MODE_KIPAS", mode: mode };
      } else if (action === "ON" || action === "OFF") {
        const targetValue = target || "POMPA";
        if (!allowedTargets.includes(targetValue)) {
          return res.status(400).json({
            success: false,
            message: `Target tidak valid. Pilihan: ${allowedTargets.join(", ")}`,
          });
        }
        payloadKeESP = { action: action, target: targetValue };
      } else if (action === "CYCLE") {
        const on = parseInt(durasi_on, 10);
        const off = parseInt(durasi_off, 10);
        if (isNaN(on) || isNaN(off) || on <= 0 || off <= 0) {
          return res
            .status(400)
            .json({ success: false, message: "Durasi siklus harus bilangan bulat positif." });
        }
        payloadKeESP = {
          action: "CYCLE",
          durasi_on: on,
          durasi_off: off,
        };
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Aksi tidak valid." });
      }

      const topicTujuan = `esp/control/${TOKEN_ESP}`;
      mqttClient.publish(topicTujuan, JSON.stringify(payloadKeESP), { qos: 1 }, (err) => {
        if (err) {
          console.error("[CONTROL] Gagal publish MQTT:", err.message);
          return res.status(500).json({
            success: false,
            message: "Gagal mengirim perintah ke perangkat",
          });
        }
      });

      return res.status(200).json({
        success: true,
        message: "Perintah diteruskan ke perangkat",
      });
    });
  }
  
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    ws.send(JSON.stringify({ ...latestStatus, type: "initial_status" }));
  });

  wss.on("close", () => clearInterval(interval));
};
