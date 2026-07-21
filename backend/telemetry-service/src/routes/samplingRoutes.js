const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const samplingController = require("../controllers/samplingController");

router.get("/sampling/active-session", verifyToken, samplingController.getActiveSession);
router.get("/sampling/all-active", verifyToken, samplingController.getAllActiveSessions);
router.get("/sampling", verifyToken, samplingController.getSamplingSessions);
router.post("/sampling", verifyToken, samplingController.createSamplingSession);
router.put("/sampling/:id", verifyToken, samplingController.updateSamplingSession);
router.delete("/sampling/:id", verifyToken, samplingController.deleteSamplingSession);

module.exports = router;
