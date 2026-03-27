const express = require('express');
const { requestOTP, verifyOTP } = require('../controllers/otpController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/request', requestOTP);
router.post('/verify', verifyOTP);

module.exports = router;
