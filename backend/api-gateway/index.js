const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors());

console.log("API Gateway V2 (Terbaru) berjalan...");

//rute auth
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://auth-service:5001",
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
  }),
);

//rute telemetry
app.use(
  "/api/telemetry",
  createProxyMiddleware({
    target: "http://telemetry-service:5002",
    changeOrigin: true,
    pathRewrite: { "^/api/telemetry": "" },
  }),
);

//rute kontrol
app.use(
  "/api/control",
  createProxyMiddleware({
    target: "http://control-service:5003",
    changeOrigin: true,
    pathRewrite: { "^/api/control": "/" },
    onProxyReq: (proxyReq, req, res) => {
      console.log(
        `[GATEWAY] Meneruskan perintah Relay ke Control Service: ${proxyReq.path}`,
      );
    },
  }),
);

//rute ws
app.use(
  "/ws/telemetry",
  createProxyMiddleware({ target: "http://telemetry-service:5002", ws: true }),
);
app.use(
  "/ws/control",
  createProxyMiddleware({ target: "http://control-service:5003", ws: true }),
);

app.listen(5000, () => console.log("Gateway listen on 5000"));
