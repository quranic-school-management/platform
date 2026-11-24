const AppError = require('../helpers/AppError');

// eslint-disable-next-line no-unused-vars
module.exports = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err instanceof AppError;

  // Log unexpected errors with full stack
  if (!isOperational) {
    console.error('Unexpected error:', err);
  }

  res.status(statusCode).json({
    error:
      isOperational || statusCode < 500
        ? err.message
        : 'Internal Server Error',
  });
};
