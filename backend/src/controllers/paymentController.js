const prisma = require('../config/database');
const { createPaymentIntent, verifyPaymentIntent } = require('../utils/stripe');
const { generatePaymentReference } = require('../utils/payment');

const createStripePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      amount,
      user.id,
      user.email
    );

    const reference = generatePaymentReference();

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
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
    res.status(500).json({ error: error.message });
  }
};

const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const result = await verifyPaymentIntent(paymentIntentId);

    if (result.success) {
      const payment = await prisma.payment.findFirst({
        where: {
          metadata: {
            path: ['paymentIntentId'],
            equals: paymentIntentId
          }
        }
      });

      if (payment) {
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
        res.status(404).json({ error: 'Payment not found' });
      }
    } else {
      res.status(400).json({ error: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStripePayment,
  confirmStripePayment
};
