const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET'];

const getNodeEnv = () => process.env.NODE_ENV || 'development';

const isProduction = () => getNodeEnv() === 'production';

const getAllowedOrigins = () => {
  const raw = process.env.CORS_ORIGIN;

  if (!raw || !raw.trim()) {
    return [];
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => {
    const value = process.env[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = {
  getNodeEnv,
  isProduction,
  getAllowedOrigins,
  validateEnv
};
