const pool = require('../config/db');
const AppError = require('../helpers/AppError');

// ── Create halaqa ───────────────────────────────────────────────
async function createHalaqa({ name, description, created_by }) {
  const { rows } = await pool.query(
    `INSERT INTO halaqat (name, description, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, created_by, created_at, updated_at`,
    [name, description || null, created_by],
  );
  return rows[0];
}

// ── List halaqat ────────────────────────────────────────────────
async function listHalaqat({ search, page = 1, limit = 50 } = {}) {
  const conditions = ['h.deleted_at IS NULL'];
  const params = [];
  let idx = 1;

  if (search) {
    conditions.push(`h.name ILIKE $${idx++}`);
    params.push(`%${search}%`);
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;
  const filterParams = [...params];

  const dataQuery = `
    SELECT h.id, h.name, h.description, h.created_by, h.created_at, h.updated_at,
           (SELECT count(*)::int FROM halaqa_students hs
            WHERE hs.halaqa_id = h.id AND hs.left_at IS NULL) AS student_count,
           (SELECT count(*)::int FROM halaqa_teachers ht
            WHERE ht.halaqa_id = h.id AND ht.removed_at IS NULL) AS teacher_count
    FROM halaqat h
    WHERE ${where}
    ORDER BY h.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}`;

  const dataParams = [...params, limit, offset];

  const [countResult, dataResult] = await Promise.all([
    pool.query(`SELECT count(*)::int AS total FROM halaqat h WHERE ${where}`, filterParams),
    pool.query(dataQuery, dataParams),
  ]);

  return {
    halaqat: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit,
  };
}

// ── List halaqat for a specific teacher ─────────────────────────
async function listHalaqatForTeacher(teacherId, { page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT h.id, h.name, h.description, h.created_at, h.updated_at,
           (SELECT count(*)::int FROM halaqa_students hs
            WHERE hs.halaqa_id = h.id AND hs.left_at IS NULL) AS student_count
    FROM halaqat h
    JOIN halaqa_teachers ht ON ht.halaqa_id = h.id
    WHERE ht.teacher_id = $1 AND ht.removed_at IS NULL AND h.deleted_at IS NULL
    ORDER BY h.created_at DESC
    LIMIT $2 OFFSET $3`;

  const countQuery = `
    SELECT count(*)::int AS total
    FROM halaqat h
    JOIN halaqa_teachers ht ON ht.halaqa_id = h.id
    WHERE ht.teacher_id = $1 AND ht.removed_at IS NULL AND h.deleted_at IS NULL`;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, [teacherId]),
    pool.query(dataQuery, [teacherId, limit, offset]),
  ]);

  return {
    halaqat: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit,
  };
}

// ── List halaqat for a specific student ─────────────────────────
async function listHalaqatForStudent(studentId, { page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT h.id, h.name, h.description, h.created_at, h.updated_at
    FROM halaqat h
    JOIN halaqa_students hs ON hs.halaqa_id = h.id
    WHERE hs.student_id = $1 AND hs.left_at IS NULL AND h.deleted_at IS NULL
    ORDER BY h.created_at DESC
    LIMIT $2 OFFSET $3`;

  const countQuery = `
    SELECT count(*)::int AS total
    FROM halaqat h
    JOIN halaqa_students hs ON hs.halaqa_id = h.id
    WHERE hs.student_id = $1 AND hs.left_at IS NULL AND h.deleted_at IS NULL`;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, [studentId]),
    pool.query(dataQuery, [studentId, limit, offset]),
  ]);

  return {
    halaqat: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit,
  };
}

// ── Get halaqa by ID ────────────────────────────────────────────
async function getHalaqaById(id) {
  const { rows } = await pool.query(
    `SELECT h.id, h.name, h.description, h.created_by, h.created_at, h.updated_at
     FROM halaqat h
     WHERE h.id = $1 AND h.deleted_at IS NULL`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Halaqa not found', 404);
  return rows[0];
}

// ── Get halaqa with its teachers and students ───────────────────
async function getHalaqaDetails(id) {
  const halaqa = await getHalaqaById(id);

  const [teachers, students] = await Promise.all([
    pool.query(
      `SELECT u.id, u.username, u.full_name, ht.assigned_at
       FROM halaqa_teachers ht
       JOIN users u ON u.id = ht.teacher_id
       WHERE ht.halaqa_id = $1 AND ht.removed_at IS NULL AND u.deleted_at IS NULL
       ORDER BY ht.assigned_at`,
      [id],
    ),
    pool.query(
      `SELECT u.id, u.username, u.full_name, hs.enrolled_at
       FROM halaqa_students hs
       JOIN users u ON u.id = hs.student_id
       WHERE hs.halaqa_id = $1 AND hs.left_at IS NULL AND u.deleted_at IS NULL
       ORDER BY hs.enrolled_at`,
      [id],
    ),
  ]);

  return {
    ...halaqa,
    teachers: teachers.rows,
    students: students.rows,
  };
}

// ── Update halaqa ───────────────────────────────────────────────
async function updateHalaqa(id, { name, description }) {
  const fields = [];
  const params = [];
  let idx = 1;

  if (name !== undefined)        { fields.push(`name = $${idx++}`);        params.push(name); }
  if (description !== undefined) { fields.push(`description = $${idx++}`); params.push(description); }

  if (fields.length === 0) throw new AppError('No fields to update', 400);

  fields.push('updated_at = now()');
  params.push(id);

  const { rows } = await pool.query(
    `UPDATE halaqat SET ${fields.join(', ')}
     WHERE id = $${idx} AND deleted_at IS NULL
     RETURNING id, name, description, created_by, created_at, updated_at`,
    params,
  );

  if (rows.length === 0) throw new AppError('Halaqa not found', 404);
  return rows[0];
}

// ── Soft-delete halaqa ──────────────────────────────────────────
async function deleteHalaqa(id) {
  const { rows } = await pool.query(
    `UPDATE halaqat SET deleted_at = now(), updated_at = now()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id, name`,
    [id],
  );
  if (rows.length === 0) throw new AppError('Halaqa not found', 404);
  return rows[0];
}

module.exports = {
  createHalaqa,
  listHalaqat,
  listHalaqatForTeacher,
  listHalaqatForStudent,
  getHalaqaById,
  getHalaqaDetails,
  updateHalaqa,
  deleteHalaqa,
};
