const express = require('express');
const { getTransactions, getTransactionById } = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getTransactions);
router.get('/:id', getTransactionById);

module.exports = router;
