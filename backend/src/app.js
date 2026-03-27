require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transactions');
const paymentRoutes = require('./routes/payment');
const otpRoutes = require('./routes/otp');
const { getNodeEnv, isProduction, getAllowedOrigins, validateEnv } = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const createApp = () => {
  validateEnv();

  const app = express();
  const NODE_ENV = getNodeEnv();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  app.use(compression());

  if (NODE_ENV !== 'test') {
    app.use(morgan(isProduction() ? 'combined' : 'dev'));
  }

  const allowedOrigins = getAllowedOrigins();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }

        if (!isProduction() || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error('CORS policy violation'));
      }
    })
  );

  app.use(
    express.json({
      limit: '100kb'
    })
  );

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction() ? 300 : 2000,
    standardHeaders: true,
    legacyHeaders: false
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction() ? 20 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Try again later.' }
  });

  app.use(globalLimiter);
  app.use('/api/auth', authLimiter);
  app.use('/api/otp', authLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/otp', otpRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', env: NODE_ENV });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;