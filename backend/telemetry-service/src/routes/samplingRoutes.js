const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const samplingController = require("../controllers/samplingController");

router.get("/sampling", verifyToken, samplingController.getSamplingSessions);
router.post("/sampling", verifyToken, samplingController.createSamplingSession);
router.delete("/sampling/:id", verifyToken, samplingController.deleteSamplingSession);

module.exports = router;
