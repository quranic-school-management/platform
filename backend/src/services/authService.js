const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const AppError = require('../helpers/AppError');
const { JWT_EXPIRES_IN } = require('../config/constants');

// ── Login ───────────────────────────────────────────────────────
async function login(username, password) {
  // 1. Find user + their hashed password from auth.users
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.full_name, u.role,
            u.must_change_password, u.is_active,
            au.encrypted_password
     FROM users u
     JOIN auth.users au ON au.id = u.id
     WHERE u.username = $1 AND u.deleted_at IS NULL`,
    [username.toLowerCase()],
  );

  if (rows.length === 0) {
    throw new AppError('Invalid username or password', 401);
  }

  const user = rows[0];

  if (!user.is_active) {
    throw new AppError('Account is deactivated. Contact the Mushrif.', 403);
  }

  // 2. Verify password
  const valid = await bcrypt.compare(password, user.encrypted_password);
  if (!valid) {
    throw new AppError('Invalid username or password', 401);
  }

  // 3. Issue JWT
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    must_change_password: user.must_change_password,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      must_change_password: user.must_change_password,
    },
  };
}

// ── Change password ─────────────────────────────────────────────
async function changePassword(userId, currentPassword, newPassword) {
  const client = await pool.connect();
  try {
    // 1. Get current hash
    const { rows } = await client.query(
      'SELECT encrypted_password FROM auth.users WHERE id = $1',
      [userId],
    );
    if (rows.length === 0) throw new AppError('User not found', 404);

    // 2. Verify current password
    const valid = await bcrypt.compare(currentPassword, rows[0].encrypted_password);
    if (!valid) throw new AppError('Current password is incorrect', 401);

    // 3. Hash new password and update both tables
    const hash = await bcrypt.hash(newPassword, 12);

    await client.query('BEGIN');
    await client.query(
      'UPDATE auth.users SET encrypted_password = $1, updated_at = now() WHERE id = $2',
      [hash, userId],
    );
    await client.query(
      'UPDATE users SET must_change_password = false, updated_at = now() WHERE id = $1',
      [userId],
    );
    await client.query('COMMIT');

    // 4. Fetch updated profile and issue a fresh JWT so middleware sees must_change_password=false
    const profile = await getProfile(userId);
    const payload = {
      id: profile.id,
      username: profile.username,
      role: profile.role,
      must_change_password: profile.must_change_password,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return { token };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Get own profile ─────────────────────────────────────────────
async function getProfile(userId) {
  const { rows } = await pool.query(
    `SELECT id, username, full_name, role, is_active,
            must_change_password, created_at, updated_at
     FROM users
     WHERE id = $1 AND deleted_at IS NULL`,
    [userId],
  );
  if (rows.length === 0) throw new AppError('User not found', 404);
  return rows[0];
}

module.exports = { login, changePassword, getProfile };
