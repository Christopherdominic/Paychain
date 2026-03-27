const prisma = require('../config/database');
const { normalizePhone, isValidOtp } = require('../utils/validation');
const { requestTransferOTP, verifyTransferOTP } = require('../services/otpService');

const requestOTP = async (req, res) => {
  try {
    const { phone, purpose = 'transaction' } = req.body;
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await requestTransferOTP(req.userId, normalizedPhone, purpose);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      sessionId: result.sessionId,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
      return res.status(400).json({ error: 'Session ID and OTP are required' });
    }

    if (!isValidOtp(String(otp))) {
      return res.status(400).json({ error: 'Invalid OTP format' });
    }

    const result = await verifyTransferOTP(req.userId, sessionId, String(otp).trim());
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      verified: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

module.exports = { requestOTP, verifyOTP, requestTransferOTP, verifyTransferOTP };
