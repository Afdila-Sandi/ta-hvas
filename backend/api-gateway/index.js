require("dotenv").config();

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true 
};
app.use(cors(corsOptions));

console.log("api gateway");

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://auth-service:5001",
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
  }),
);

app.use(
  "/api/telemetry",
  createProxyMiddleware({
    target: "http://telemetry-service:5002",
    changeOrigin: true,
    pathRewrite: { "^/api/telemetry": "" },
  }),
);

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

app.use(
  "/api/ws/telemetry",
  createProxyMiddleware({ target: "http://telemetry-service:5002", ws: true }),
);
app.use(
  "/api/ws/control",
  createProxyMiddleware({ target: "http://control-service:5003", ws: true }),
);

app.listen(5000, "0.0.0.0", () =>
  console.log("Gateway listen on 0.0.0.0:5000"),
);
