const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const AppError = require('../helpers/AppError');
const asyncHandler = require('../helpers/asyncHandler');

/**
 * Verify the Bearer JWT, then load the live user row so deactivation,
 * deletion, role changes, and password-reset flags take effect immediately.
 */
module.exports = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_err) {
    throw new AppError('Invalid or expired token', 401);
  }

  const { rows } = await pool.query(
    `SELECT id, username, full_name, role, is_active, must_change_password
     FROM users
     WHERE id = $1 AND deleted_at IS NULL`,
    [decoded.id],
  );

  if (rows.length === 0) {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = rows[0];
  if (!user.is_active) {
    throw new AppError('Account is deactivated. Contact the Mushrif.', 403);
  }

  req.user = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    must_change_password: user.must_change_password,
  };
  next();
});
