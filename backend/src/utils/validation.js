const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const OTP_REGEX = /^[0-9]{4,8}$/;

const parsePositiveAmount = (value, { max = 1000000000 } = {}) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  if (amount > max) {
    return null;
  }

  return Number(amount.toFixed(2));
};

const normalizeEmail = (email) => {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
};

const isValidEmail = (email) => EMAIL_REGEX.test(normalizeEmail(email));

const normalizePhone = (phone) => {
  if (typeof phone !== 'string') {
    return '';
  }

  return phone.trim();
};

const isValidPhone = (phone) => PHONE_REGEX.test(normalizePhone(phone));

const isValidOtp = (otp) => {
  if (typeof otp !== 'string') {
    return false;
  }

  return OTP_REGEX.test(otp.trim());
};

const asBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return defaultValue;
};

module.exports = {
  parsePositiveAmount,
  normalizeEmail,
  isValidEmail,
  normalizePhone,
  isValidPhone,
  isValidOtp,
  asBoolean
};
