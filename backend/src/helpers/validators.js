const AppError = require('./AppError');
const { MIN_PASSWORD_LENGTH } = require('../config/constants');

/**
 * Assert that `body` has every key in `required` and each is a non-empty string.
 * Returns an object with the trimmed values.
 */
function requireFields(body, required) {
  const out = {};
  for (const key of required) {
    const val = body[key];
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      throw new AppError(`Missing required field: ${key}`, 400);
    }
    out[key] = typeof val === 'string' ? val.trim() : val;
  }
  return out;
}

/**
 * Assert that value is one of the allowed options.
 */
function requireEnum(value, allowed, fieldName) {
  if (!allowed.includes(value)) {
    throw new AppError(
      `Invalid ${fieldName}: must be one of ${allowed.join(', ')}`,
      400,
    );
  }
  return value;
}

/**
 * Validate password strength (minimum 8 characters).
 */
function validatePassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
  }
}

/**
 * Validate UUID v4 format.
 */
function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function requireUUID(value, fieldName) {
  if (!isValidUUID(value)) {
    throw new AppError(`Invalid UUID for ${fieldName}`, 400);
  }
  return value;
}

/**
 * Require a calendar date as YYYY-MM-DD.
 */
function requireDate(value, fieldName) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(`${fieldName} must be a date in YYYY-MM-DD format`, 400);
  }
  const [year, month, day] = value.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
  return value;
}

module.exports = {
  requireFields,
  requireEnum,
  validatePassword,
  isValidUUID,
  requireUUID,
  requireDate,
};
