const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const AppError = require('../helpers/AppError');
const { generateUniqueUsername } = require('../helpers/slugGenerator');
const { QMS_EMAIL_DOMAIN, SUPABASE_INSTANCE_ID } = require('../config/constants');

// ── Create user ─────────────────────────────────────────────────
/**
 * Format a Date or date string to DD-MM-YYYY for use as default password.
 */
function formatDOBPassword(dob) {
  if (!dob) return null;
  const iso = String(dob).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

async function createUser({ full_name, role, username: preferredUsername, date_of_birth }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Resolve username
    let username;
    if (preferredUsername) {
      if (!/^[a-z0-9._-]+$/.test(preferredUsername)) {
        throw new AppError(
          'Username must contain only lowercase letters, digits, dots, dashes, and underscores',
          400,
        );
      }
      const { rows: existing } = await client.query(
        'SELECT 1 FROM users WHERE username = $1',
        [preferredUsername],
      );
      if (existing.length > 0) throw new AppError('Username is already taken', 409);
      username = preferredUsername;
    } else {
      username = await generateUniqueUsername(full_name, client);
    }

    const dobPassword = formatDOBPassword(date_of_birth);
    if (!dobPassword) {
      throw new AppError('date_of_birth is required and must be a valid date', 400);
    }
    const passwordHash = await bcrypt.hash(dobPassword, 12);

    // 3. IDs & email
    const id = crypto.randomUUID();
    const email = `${username}@${QMS_EMAIL_DOMAIN}`;

    // 4. Insert into auth.users (Supabase FK requirement)
    await client.query(
      `INSERT INTO auth.users (
         instance_id, id, aud, role, email, encrypted_password,
         email_confirmed_at, created_at, updated_at,
         raw_app_meta_data, raw_user_meta_data,
         confirmation_token, recovery_token,
         email_change_token_new, email_change
       ) VALUES (
         $1, $2, 'authenticated', 'authenticated', $3, $4,
         now(), now(), now(),
         '{"provider":"username","providers":["username"]}', '{}',
         '', '', '', ''
       )`,
      [SUPABASE_INSTANCE_ID, id, email, passwordHash],
    );

    // 5. Insert into public.users
    const { rows } = await client.query(
      `INSERT INTO users (id, username, full_name, role, date_of_birth, must_change_password, is_active)
       VALUES ($1, $2, $3, $4, $5, true, true)
       RETURNING id, username, full_name, role, date_of_birth, must_change_password, is_active, created_at`,
      [id, username, full_name, role, date_of_birth],
    );

    await client.query('COMMIT');
    return { user: rows[0], default_password: dobPassword };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── List users ──────────────────────────────────────────────────
async function listUsers({ role, is_active, search, page = 1, limit = 50 } = {}) {
  const conditions = ['u.deleted_at IS NULL'];
  const params = [];
  let idx = 1;

  if (role) {
    conditions.push(`u.role = $${idx++}`);
    params.push(role);
  }
  if (is_active !== undefined) {
    conditions.push(`u.is_active = $${idx++}`);
    params.push(is_active);
  }
  if (search) {
    conditions.push(`(u.username ILIKE $${idx} OR u.full_name ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;
  const filterParams = [...params]; // snapshot before limit/offset

  const dataQuery = `
    SELECT u.id, u.username, u.full_name, u.role, u.is_active,
           u.date_of_birth, u.must_change_password, u.created_at, u.updated_at
    FROM users u
    WHERE ${where}
    ORDER BY u.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}`;

  const dataParams = [...params, limit, offset];

  const [countResult, dataResult] = await Promise.all([
    pool.query(`SELECT count(*)::int AS total FROM users u WHERE ${where}`, filterParams),
    pool.query(dataQuery, dataParams),
  ]);

  return {
    users: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit,
  };
}

// ── Get by ID ───────────────────────────────────────────────────
async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, username, full_name, role, is_active,
            date_of_birth, must_change_password, created_at, updated_at
     FROM users
     WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  if (rows.length === 0) throw new AppError('User not found', 404);
  return rows[0];
}

// ── Update ──────────────────────────────────────────────────────
async function updateUser(id, { full_name, role, is_active, date_of_birth }) {
  const fields = [];
  const params = [];
  let idx = 1;

  if (full_name !== undefined)      { fields.push(`full_name = $${idx++}`);      params.push(full_name); }
  if (role !== undefined)           { fields.push(`role = $${idx++}`);           params.push(role); }
  if (is_active !== undefined)      { fields.push(`is_active = $${idx++}`);      params.push(is_active); }
  if (date_of_birth !== undefined)  { fields.push(`date_of_birth = $${idx++}`);  params.push(date_of_birth); }

  if (fields.length === 0) throw new AppError('No fields to update', 400);

  fields.push('updated_at = now()');
  params.push(id);

  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')}
     WHERE id = $${idx} AND deleted_at IS NULL
     RETURNING id, username, full_name, role, is_active, date_of_birth, must_change_password, created_at, updated_at`,
    params,
  );

  if (rows.length === 0) throw new AppError('User not found', 404);
  return rows[0];
}

// ── Soft-delete ─────────────────────────────────────────────────
async function deleteUser(id) {
  const { rows } = await pool.query(
    `UPDATE users SET deleted_at = now(), is_active = false, updated_at = now()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id, username`,
    [id],
  );
  if (rows.length === 0) throw new AppError('User not found', 404);
  return rows[0];
}

// ── Reset password (Mushrif action) ─────────────────────────────
async function resetPassword(userId) {
  // Get user to find their date_of_birth
  const user = await getUserById(userId);
  const dobPassword = formatDOBPassword(user.date_of_birth);
  if (!dobPassword) {
    throw new AppError(
      'This user has no date of birth. Set date_of_birth before resetting the password.',
      400,
    );
  }

  const hash = await bcrypt.hash(dobPassword, 12);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE auth.users SET encrypted_password = $1, updated_at = now() WHERE id = $2',
      [hash, userId],
    );
    await client.query(
      'UPDATE users SET must_change_password = true, updated_at = now() WHERE id = $1',
      [userId],
    );
    await client.query('COMMIT');
    return { user, default_password: dobPassword };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetPassword,
};
