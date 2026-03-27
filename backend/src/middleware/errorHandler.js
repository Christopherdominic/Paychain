const { isProduction } = require('../config/env');

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

const errorHandler = (error, req, res, next) => {
  const status = Number(error.status) || 500;
  const safeMessage = status >= 500 ? 'Internal server error' : error.message;

  if (!isProduction()) {
    console.error('[API Error]', {
      method: req.method,
      path: req.originalUrl,
      status,
      message: error.message,
      stack: error.stack
    });
  } else {
    console.error('[API Error]', {
      method: req.method,
      path: req.originalUrl,
      status,
      message: error.message
    });
  }

  if (res.headersSent) {
    return next(error);
  }

  return res.status(status).json({
    error: safeMessage,
    ...(isProduction() ? {} : { details: error.details || undefined })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
