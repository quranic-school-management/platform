/**
 * Operational error with an HTTP status code.
 * Throw this in services / controllers for expected failures (400, 401, 404 …).
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
