const prisma = require('../config/database');
const { generatePaymentReference, simulateInterswitchPayment } = require('../utils/payment');
const { simulateBlockchainTransaction } = require('../utils/blockchain');
const ethereum = require('../utils/ethereum');

const getWallet = async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.userId }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
};

const fundWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const reference = generatePaymentReference();
    
    // Simulate payment gateway
    const paymentResult = await simulateInterswitchPayment(amount, reference);

    if (!paymentResult.success) {
      await prisma.payment.create({
        data: {
          userId: req.userId,
          amount,
          status: 'failed',
          reference
        }
      });
      return res.status(400).json({ error: 'Payment failed' });
    }

    // Update wallet balance
    const wallet = await prisma.wallet.update({
      where: { userId: req.userId },
      data: { balance: { increment: amount } }
    });

    await prisma.payment.create({
      data: {
        userId: req.userId,
        amount,
        status: 'success',
        reference
      }
    });

    res.json({ wallet, reference, message: 'Wallet funded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fund wallet' });
  }
};

const sendMoney = async (req, res) => {
  try {
    const { receiverEmail, amount, type = 'fiat' } = req.body;

    if (!receiverEmail || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const sender = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { wallet: true }
    });

    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
      include: { wallet: true }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    if (sender.id === receiver.id) {
      return res.status(400).json({ error: 'Cannot send to yourself' });
    }

    if (sender.wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    let blockchainTxHash = null;
    
    if (type === 'crypto') {
      if (ethereum.isConfigured()) {
        // Real blockchain transaction
        try {
          const txId = `TX-${Date.now()}-${sender.id}`;
          const result = await ethereum.sendBlockchainTransaction(
            receiver.wallet.walletAddress,
            amount,
            txId
          );
          blockchainTxHash = result.txHash;
        } catch (error) {
          return res.status(500).json({ error: 'Blockchain transaction failed: ' + error.message });
        }
      } else {
        // Fallback to simulation
        const blockchainResult = await simulateBlockchainTransaction(
          amount,
          sender.wallet.walletAddress,
          receiver.wallet.walletAddress
        );
        blockchainTxHash = blockchainResult.txHash;
      }
    }

    // Perform transaction
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          amount,
          status: 'success',
          type,
          blockchainTxHash
        }
      }),
      prisma.wallet.update({
        where: { userId: sender.id },
        data: { balance: { decrement: amount } }
      }),
      prisma.wallet.update({
        where: { userId: receiver.id },
        data: { balance: { increment: amount } }
      })
    ]);

    res.json({ 
      transaction, 
      message: 'Transfer successful',
      blockchainEnabled: ethereum.isConfigured()
    });
  } catch (error) {
    res.status(500).json({ error: 'Transfer failed' });
  }
};

module.exports = { getWallet, fundWallet, sendMoney };

