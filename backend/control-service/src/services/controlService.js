const WebSocket = require("ws");
const mqtt = require("mqtt");
const jwt = require("jsonwebtoken");

exports.initControlService = (server, app) => {
  const SECRET_KEY = process.env.JWT_SECRET;
  const MQTT_BROKER = process.env.MQTT_BROKER;
  const mqttClient = mqtt.connect(MQTT_BROKER);
  const wss = new WebSocket.Server({ server, path: "/ws/control" });

  let currentRelayStatus = "OFF";
  let timerEndTime = null;

  let isCycleMode = false;
  let durasiOnMs = 0;
  let durasiOffMs = 0;
  let currentPhase = "OFF";

  function broadcastStatus() {
    const statusPayload = {
      status_pompa: currentRelayStatus,
      timer_end_time: timerEndTime ? timerEndTime.toISOString() : null,
      cycle_phase: isCycleMode ? currentPhase : null,
      type: "status_update",
    };
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(statusPayload));
      }
    });
  }

  mqttClient.on("connect", () => {
    console.log("Control Service terhubung ke Broker MQTT");
    mqttClient.subscribe("esp/data");
  });

  mqttClient.on("message", (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.status_pompa) {
        currentRelayStatus = data.status_pompa;
      }
    } catch (err) {}
  });

  setInterval(() => {
    if (timerEndTime && Date.now() >= timerEndTime.getTime()) {
      if (isCycleMode) {
        if (currentPhase === "ON") {
          console.log("[SIKLUS] Waktu ON habis. Mematikan mesin.");
          currentPhase = "OFF";
          currentRelayStatus = "OFF";
          timerEndTime = new Date(Date.now() + durasiOffMs);
          mqttClient.publish("esp/pompa/kontrol", "OFF");
        } else {
          console.log("[SIKLUS] Waktu OFF habis. Menyalakan mesin.");
          currentPhase = "ON";
          currentRelayStatus = "ON";
          timerEndTime = new Date(Date.now() + durasiOnMs);
          mqttClient.publish("esp/pompa/kontrol", "ON");
        }
        broadcastStatus();
      } else {
        mqttClient.publish("esp/pompa/kontrol", "OFF");
        timerEndTime = null;
        currentRelayStatus = "OFF";
        broadcastStatus();
      }
    }
  }, 1000);

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

      console.log("[DEBUG API] Payload diterima:", req.body);

      const { action, durasi_on, durasi_off, durasi } = req.body;

      if (action === "ON" || action === "OFF") {
        isCycleMode = false;
        timerEndTime = null;
        currentPhase = null;
        currentRelayStatus = action;
        mqttClient.publish("esp/pompa/kontrol", action);
        broadcastStatus();
        return res
          .status(200)
          .json({ success: true, message: `Perintah ${action} berhasil.` });
      } else if (action === "CYCLE") {
        if (!durasi_on || !durasi_off) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Nilai durasi_on atau durasi_off kosong/tidak valid.",
            });
        }
        isCycleMode = true;
        durasiOnMs = parseInt(durasi_on) * 60000;
        durasiOffMs = parseInt(durasi_off) * 60000;
        currentPhase = "ON";
        currentRelayStatus = "ON";
        timerEndTime = new Date(Date.now() + durasiOnMs);
        mqttClient.publish("esp/pompa/kontrol", "ON");
        broadcastStatus();
        return res
          .status(200)
          .json({
            success: true,
            message: `Siklus dimulai: ON ${durasi_on}m, OFF ${durasi_off}m.`,
          });
      }

      else if (action === "TIMER") {
        if (!durasi) {
          return res
            .status(400)
            .json({ success: false, message: "Nilai durasi kosong." });
        }
        isCycleMode = false;
        currentPhase = null;
        currentRelayStatus = "ON";
        timerEndTime = new Date(Date.now() + parseInt(durasi) * 60000);
        mqttClient.publish("esp/pompa/kontrol", "ON");
        broadcastStatus();
        return res
          .status(200)
          .json({ success: true, message: `Timer aktif ${durasi} menit.` });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Aksi tidak valid." });
      }
    });
  }

  wss.on("connection", (ws) => {
    ws.send(
      JSON.stringify({
        status_pompa: currentRelayStatus,
        timer_end_time: timerEndTime ? timerEndTime.toISOString() : null,
        cycle_phase: isCycleMode ? currentPhase : null,
        type: "initial_status",
      }),
    );
  });
};
