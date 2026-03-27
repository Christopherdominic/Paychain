const prisma = require('../config/database');
const interswitchService = require('./interswitchService');

const OTP_SESSION_TTL_MS = 10 * 60 * 1000;

const requestTransferOTP = async (userId, phone, purpose = 'transaction') => {
  const result = await interswitchService.sendOTP(
    phone,
    `Your PayChain ${purpose} verification code`
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  const otpSession = await prisma.oTPSession.create({
    data: {
      userId,
      tokenId: result.tokenId,
      phone,
      purpose,
      expiresAt: new Date(Date.now() + OTP_SESSION_TTL_MS)
    }
  });

  return {
    success: true,
    sessionId: otpSession.id
  };
};

const verifyTransferOTP = async (userId, sessionId, otp, expectedPurpose) => {
  const session = await prisma.oTPSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    return { success: false, message: 'Invalid session' };
  }

  if (session.userId !== userId) {
    return { success: false, message: 'Unauthorized' };
  }

  if (session.verified) {
    return { success: false, message: 'OTP already used' };
  }

  if (new Date() > session.expiresAt) {
    return { success: false, message: 'OTP expired' };
  }

  if (expectedPurpose && session.purpose !== expectedPurpose) {
    return { success: false, message: 'OTP does not match this transfer' };
  }

  const result = await interswitchService.verifyOTP(session.tokenId, otp);
  if (!result.success || !result.verified) {
    return { success: false, message: result.message || 'Invalid OTP' };
  }

  await prisma.oTPSession.update({
    where: { id: sessionId },
    data: { verified: true }
  });

  return { success: true };
};

const assertVerifiedSession = async (userId, sessionId, expectedPurpose) => {
  const session = await prisma.oTPSession.findUnique({
    where: { id: sessionId }
  });

  if (!session || session.userId !== userId) {
    return { success: false, message: 'Invalid OTP session' };
  }

  if (!session.verified) {
    return { success: false, message: 'OTP session is not verified' };
  }

  if (new Date() > session.expiresAt) {
    return { success: false, message: 'OTP session expired' };
  }

  if (expectedPurpose && session.purpose !== expectedPurpose) {
    return { success: false, message: 'OTP does not match this transfer' };
  }

  return { success: true };
};

module.exports = {
  requestTransferOTP,
  verifyTransferOTP,
  assertVerifiedSession
};
