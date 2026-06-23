const WebSocket = require("ws");
const mqtt = require("mqtt");
const jwt = require("jsonwebtoken");

exports.initControlService = (server, app) => {
  const SECRET_KEY = process.env.JWT_SECRET;
  const MQTT_BROKER = process.env.MQTT_BROKER;

  const TOKEN_ESP = process.env.TOKEN_ESP;

  const mqttClient = mqtt.connect(MQTT_BROKER, {
    rejectUnauthorized: false,
  });

  const wss = new WebSocket.Server({ server, path: "/ws/control" });

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
      if (data.status_pompa || data.status_kipas) {
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

      if (action === "SET_MODE_KIPAS") {
        payloadKeESP = { action: "SET_MODE_KIPAS", mode: mode };
      } else if (action === "ON" || action === "OFF") {
        payloadKeESP = { action: action, target: target || "POMPA" };
      } else if (action === "CYCLE") {
        if (!durasi_on || !durasi_off) {
          return res
            .status(400)
            .json({ success: false, message: "Durasi siklus tidak valid." });
        }
        payloadKeESP = {
          action: "CYCLE",
          durasi_on: parseInt(durasi_on),
          durasi_off: parseInt(durasi_off),
        };
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Aksi tidak valid." });
      }

      const topicTujuan = `esp/control/${TOKEN_ESP}`;
      mqttClient.publish(topicTujuan, JSON.stringify(payloadKeESP));

      return res.status(200).json({
        success: true,
        message: `Perintah diteruskan ke alat via topik ${topicTujuan}`,
      });
    });
  }

  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ ...latestStatus, type: "initial_status" }));
  });
};
