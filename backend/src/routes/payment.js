const express = require('express');
const { createStripePayment, confirmStripePayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/stripe/create', createStripePayment);
router.post('/stripe/confirm', confirmStripePayment);

module.exports = router;
