const express = require('express');
const { getWallet, fundWallet, sendMoney } = require('../controllers/walletController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getWallet);
router.post('/fund', fundWallet);
router.post('/send', sendMoney);

module.exports = router;
