const crypto = require('crypto');
const pool = require('../config/db');

/**
 * Build a URL-safe slug from a full name.
 *   "Ahmed Al-Karim"  → "ahmed.al-karim"
 *   "محمد أحمد"       → falls back to "user.<hex>"
 */
function nameToSlug(fullName) {
  let slug = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')                // strip diacritics
    .replace(/[\u0600-\u06FF\u0750-\u077F]+/g, '')  // strip Arabic
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^[._-]+|[._-]+$/g, '');

  if (slug.length < 3) {
    slug = 'user.' + crypto.randomBytes(3).toString('hex');
  }
  return slug;
}

/**
 * Returns a username guaranteed unique in the users table.
 * Accepts an optional PG client (for use inside a transaction).
 */
async function generateUniqueUsername(fullName, client) {
  const db = client || pool;
  const base = nameToSlug(fullName);
  let candidate = base;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { rows } = await db.query(
      'SELECT 1 FROM users WHERE username = $1',
      [candidate],
    );
    if (rows.length === 0) return candidate;
    counter++;
    candidate = `${base}.${counter}`;
  }
}

module.exports = { nameToSlug, generateUniqueUsername };
