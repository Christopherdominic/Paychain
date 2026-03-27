const prisma = require('../config/database');
const { generatePaymentReference, processInterswitchPayment, simulateInterswitchPayment } = require('../utils/payment');
const { simulateBlockchainTransaction } = require('../utils/blockchain');
const ethereum = require('../utils/ethereum');
const { parsePositiveAmount, normalizeEmail, asBoolean, isValidOtp } = require('../utils/validation');
const { requestTransferOTP, verifyTransferOTP, assertVerifiedSession } = require('../services/otpService');

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
    const { amount, useInterswitch = true } = req.body;
    const normalizedAmount = parsePositiveAmount(amount, { max: 10000000 });
    const shouldUseInterswitch = asBoolean(useInterswitch, true);

    if (!normalizedAmount) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const reference = generatePaymentReference();
    
    let paymentResult;
    
    if (shouldUseInterswitch) {
      paymentResult = await processInterswitchPayment(normalizedAmount, reference, user);
    } else {
      paymentResult = await simulateInterswitchPayment(normalizedAmount, reference);
    }

    if (!paymentResult.success) {
      await prisma.payment.create({
        data: {
          userId: req.userId,
          amount: normalizedAmount,
          status: 'failed',
          reference,
          metadata: { error: paymentResult.message }
        }
      });
      return res.status(400).json({ error: paymentResult.message || 'Payment failed' });
    }

    const wallet = await prisma.wallet.update({
      where: { userId: req.userId },
      data: { balance: { increment: normalizedAmount } }
    });

    await prisma.payment.create({
      data: {
        userId: req.userId,
        amount: normalizedAmount,
        status: 'success',
        reference: paymentResult.reference,
        metadata: { 
          authorizationUrl: paymentResult.authorizationUrl,
          provider: shouldUseInterswitch ? 'interswitch' : 'simulation'
        }
      }
    });

    res.json({ 
      wallet, 
      reference: paymentResult.reference, 
      authorizationUrl: paymentResult.authorizationUrl,
      message: 'Wallet funded successfully' 
    });
  } catch (error) {
    console.error('Fund wallet error:', error);
    res.status(500).json({ error: 'Failed to fund wallet' });
  }
};

const sendMoney = async (req, res) => {
  try {
    const {
      receiverEmail,
      amount,
      type = 'fiat',
      otpSessionId,
      sessionId,
      otp
    } = req.body;

    const normalizedEmail = normalizeEmail(receiverEmail);
    const normalizedAmount = parsePositiveAmount(amount, { max: 10000000 });
    const transferType = type === 'crypto' ? 'crypto' : 'fiat';
    const resolvedSessionId = otpSessionId || sessionId;

    if (!normalizedEmail || !normalizedAmount) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const sender = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { wallet: true }
    });

    if (!sender || !sender.wallet) {
      return res.status(404).json({ error: 'Sender wallet not found' });
    }

    if (transferType === 'fiat') {
      if (resolvedSessionId && otp) {
        if (!isValidOtp(String(otp))) {
          return res.status(400).json({ error: 'Invalid OTP format' });
        }

        const verifyResult = await verifyTransferOTP(req.userId, resolvedSessionId, String(otp).trim(), 'transaction');
        if (!verifyResult.success) {
          return res.status(400).json({ error: verifyResult.message });
        }
      } else if (resolvedSessionId) {
        const sessionResult = await assertVerifiedSession(req.userId, resolvedSessionId, 'transaction');
        if (!sessionResult.success) {
          return res.status(400).json({ error: sessionResult.message });
        }
      } else {
        const otpPhone = sender.phone && sender.phone.trim() ? sender.phone : null;
        if (!otpPhone) {
          return res.status(400).json({ error: 'Phone number is required before initiating OTP transfer' });
        }

        const requestResult = await requestTransferOTP(req.userId, otpPhone, 'transaction');
        if (!requestResult.success) {
          return res.status(400).json({ error: requestResult.message || 'Failed to send OTP' });
        }

        return res.status(202).json({
          requiresOtp: true,
          sessionId: requestResult.sessionId,
          message: 'OTP sent successfully. Verify to complete transfer.'
        });
      }
    }

    const receiver = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { wallet: true }
    });

    if (!receiver || !receiver.wallet) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    if (sender.id === receiver.id) {
      return res.status(400).json({ error: 'Cannot send to yourself' });
    }

    if (sender.wallet.balance < normalizedAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    let blockchainTxHash = null;
    
    if (transferType === 'crypto') {
      if (ethereum.isConfigured()) {
        try {
          const txId = `TX-${Date.now()}-${sender.id}`;
          const result = await ethereum.sendBlockchainTransaction(
            receiver.wallet.walletAddress,
            normalizedAmount,
            txId
          );
          blockchainTxHash = result.txHash;
        } catch (error) {
          return res.status(500).json({ error: 'Blockchain transaction failed: ' + error.message });
        }
      } else {
        const blockchainResult = await simulateBlockchainTransaction(
          normalizedAmount,
          sender.wallet.walletAddress,
          receiver.wallet.walletAddress
        );
        blockchainTxHash = blockchainResult.txHash;
      }
    }

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          amount: normalizedAmount,
          status: 'success',
          type: transferType,
          blockchainTxHash
        }
      }),
      prisma.wallet.update({
        where: { userId: sender.id },
        data: { balance: { decrement: normalizedAmount } }
      }),
      prisma.wallet.update({
        where: { userId: receiver.id },
        data: { balance: { increment: normalizedAmount } }
      })
    ]);

    res.json({ 
      transaction, 
      message: 'Transfer successful',
      blockchainEnabled: ethereum.isConfigured()
    });
  } catch (error) {
    console.error('Send money error:', error);
    res.status(500).json({ error: 'Transfer failed' });
  }
};

module.exports = { getWallet, fundWallet, sendMoney };
