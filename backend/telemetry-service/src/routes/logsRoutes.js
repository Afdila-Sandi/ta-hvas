const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/logs', verifyToken, logsController.getLogs);

module.exports = router;