const crypto = require('crypto');
const interswitchService = require('../services/interswitchService');

const generatePaymentReference = () => {
  return 'PAY-' + crypto.randomBytes(8).toString('hex').toUpperCase();
};

const processInterswitchPayment = async (amount, reference, user) => {
  try {
    const result = await interswitchService.initiatePayment({
      amount,
      customerId: user.id,
      customerEmail: user.email,
      customerPhone: user.phone || '08000000000',
      reference,
      description: 'PayChain wallet funding'
    });

    if (!result.success) {
      return {
        success: false,
        reference,
        message: result.message
      };
    }

    const isSandbox = (process.env.ISW_BASE_URL || '').includes('sandbox');

    return {
      success: true,
      simulated: isSandbox,
      reference: result.reference,
      authorizationUrl: result.authorizationUrl,
      providerResponse: result.data,
      message: isSandbox ? 'Sandbox payment simulated successfully' : 'Payment initiated successfully'
    };
  } catch (error) {
    return {
      success: false,
      reference,
      message: error.message
    };
  }
};

const simulateInterswitchPayment = async (amount, reference) => {
  // Fallback simulation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const success = Math.random() > 0.05;
  
  return {
    success,
    reference,
    amount,
    message: success ? 'Payment successful' : 'Payment failed'
  };
};

module.exports = {
  generatePaymentReference,
  processInterswitchPayment,
  simulateInterswitchPayment
};
