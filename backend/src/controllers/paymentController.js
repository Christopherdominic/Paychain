const prisma = require('../config/database');
const { createPaymentIntent, verifyPaymentIntent } = require('../utils/stripe');
const { generatePaymentReference } = require('../utils/payment');
const { parsePositiveAmount } = require('../utils/validation');

const createStripePayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const normalizedAmount = parsePositiveAmount(amount, { max: 10000000 });

    if (!normalizedAmount) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      normalizedAmount,
      user.id,
      user.email
    );

    const reference = generatePaymentReference();

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: normalizedAmount,
        status: 'pending',
        reference,
        metadata: { paymentIntentId }
      }
    });

    res.json({
      clientSecret,
      reference,
      paymentIntentId
    });
  } catch (error) {
    console.error('Create Stripe payment error:', error);
    res.status(500).json({ error: 'Failed to create Stripe payment' });
  }
};

const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return res.status(400).json({ error: 'paymentIntentId is required' });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        userId: req.userId,
        metadata: {
          path: ['paymentIntentId'],
          equals: paymentIntentId
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status === 'success') {
      return res.json({ success: true, message: 'Payment already confirmed' });
    }

    const result = await verifyPaymentIntent(paymentIntentId);

    if (result.success) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'success' }
        }),
        prisma.wallet.update({
          where: { userId: payment.userId },
          data: { balance: { increment: payment.amount } }
        })
      ]);

      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' }
      });
      res.status(400).json({ error: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Confirm Stripe payment error:', error);
    res.status(500).json({ error: 'Failed to confirm Stripe payment' });
  }
};

module.exports = {
  createStripePayment,
  confirmStripePayment
};
