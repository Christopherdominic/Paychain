const crypto = require('crypto');

const generatePaymentReference = () => {
  return 'PAY-' + crypto.randomBytes(8).toString('hex').toUpperCase();
};

const simulateInterswitchPayment = async (amount, reference) => {
  // Simulate payment gateway processing
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 95% success rate
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
  simulateInterswitchPayment
};
