const pool = require('../config/db');
const AppError = require('../helpers/AppError');

// ── Assign teacher to halaqa ────────────────────────────────────
async function assignTeacher(halaqaId, teacherId) {
  // Verify teacher exists and has the teacher role
  const { rows: userRows } = await pool.query(
    `SELECT id FROM users WHERE id = $1 AND role = 'teacher' AND deleted_at IS NULL AND is_active = true`,
    [teacherId],
  );
  if (userRows.length === 0) {
    throw new AppError('Teacher not found or is not an active teacher', 404);
  }

  // Verify halaqa exists
  const { rows: halaqaRows } = await pool.query(
    'SELECT id FROM halaqat WHERE id = $1 AND deleted_at IS NULL',
    [halaqaId],
  );
  if (halaqaRows.length === 0) throw new AppError('Halaqa not found', 404);

  // Check if already assigned (unique index will also catch this)
  const { rows: existing } = await pool.query(
    `SELECT id FROM halaqa_teachers
     WHERE halaqa_id = $1 AND teacher_id = $2 AND removed_at IS NULL`,
    [halaqaId, teacherId],
  );
  if (existing.length > 0) {
    throw new AppError('Teacher is already assigned to this halaqa', 409);
  }

  const { rows } = await pool.query(
    `INSERT INTO halaqa_teachers (halaqa_id, teacher_id, teacher_role)
     VALUES ($1, $2, 'teacher')
     RETURNING id, halaqa_id, teacher_id, assigned_at`,
    [halaqaId, teacherId],
  );
  return rows[0];
}

// ── Remove teacher from halaqa ──────────────────────────────────
async function removeTeacher(halaqaId, teacherId) {
  const { rows } = await pool.query(
    `UPDATE halaqa_teachers
     SET removed_at = now()
     WHERE halaqa_id = $1 AND teacher_id = $2 AND removed_at IS NULL
     RETURNING id, halaqa_id, teacher_id, removed_at`,
    [halaqaId, teacherId],
  );
  if (rows.length === 0) {
    throw new AppError('Teacher assignment not found', 404);
  }
  return rows[0];
}

// ── List teachers of a halaqa ───────────────────────────────────
async function listTeachers(halaqaId) {
  // Verify halaqa exists
  const { rows: halaqaRows } = await pool.query(
    'SELECT id FROM halaqat WHERE id = $1 AND deleted_at IS NULL',
    [halaqaId],
  );
  if (halaqaRows.length === 0) throw new AppError('Halaqa not found', 404);

  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.full_name, ht.assigned_at
     FROM halaqa_teachers ht
     JOIN users u ON u.id = ht.teacher_id
     WHERE ht.halaqa_id = $1 AND ht.removed_at IS NULL AND u.deleted_at IS NULL
     ORDER BY ht.assigned_at`,
    [halaqaId],
  );
  return rows;
}

// ── Enroll student in halaqa ────────────────────────────────────
async function enrollStudent(halaqaId, studentId) {
  // Verify student exists and has the student role
  const { rows: userRows } = await pool.query(
    `SELECT id FROM users WHERE id = $1 AND role = 'student' AND deleted_at IS NULL AND is_active = true`,
    [studentId],
  );
  if (userRows.length === 0) {
    throw new AppError('Student not found or is not an active student', 404);
  }

  // Verify halaqa exists
  const { rows: halaqaRows } = await pool.query(
    'SELECT id FROM halaqat WHERE id = $1 AND deleted_at IS NULL',
    [halaqaId],
  );
  if (halaqaRows.length === 0) throw new AppError('Halaqa not found', 404);

  // Check if already enrolled
  const { rows: existing } = await pool.query(
    `SELECT id FROM halaqa_students
     WHERE halaqa_id = $1 AND student_id = $2 AND left_at IS NULL`,
    [halaqaId, studentId],
  );
  if (existing.length > 0) {
    throw new AppError('Student is already enrolled in this halaqa', 409);
  }

  const { rows } = await pool.query(
    `INSERT INTO halaqa_students (halaqa_id, student_id, student_role)
     VALUES ($1, $2, 'student')
     RETURNING id, halaqa_id, student_id, enrolled_at`,
    [halaqaId, studentId],
  );
  return rows[0];
}

// ── Withdraw student from halaqa ────────────────────────────────
async function withdrawStudent(halaqaId, studentId) {
  const { rows } = await pool.query(
    `UPDATE halaqa_students
     SET left_at = now()
     WHERE halaqa_id = $1 AND student_id = $2 AND left_at IS NULL
     RETURNING id, halaqa_id, student_id, left_at`,
    [halaqaId, studentId],
  );
  if (rows.length === 0) {
    throw new AppError('Student enrollment not found', 404);
  }
  return rows[0];
}

// ── List students of a halaqa ───────────────────────────────────
async function listStudents(halaqaId) {
  // Verify halaqa exists
  const { rows: halaqaRows } = await pool.query(
    'SELECT id FROM halaqat WHERE id = $1 AND deleted_at IS NULL',
    [halaqaId],
  );
  if (halaqaRows.length === 0) throw new AppError('Halaqa not found', 404);

  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.full_name, hs.enrolled_at
     FROM halaqa_students hs
     JOIN users u ON u.id = hs.student_id
     WHERE hs.halaqa_id = $1 AND hs.left_at IS NULL AND u.deleted_at IS NULL
     ORDER BY hs.enrolled_at`,
    [halaqaId],
  );
  return rows;
}

// ── Bulk enroll students ────────────────────────────────────────
async function bulkEnrollStudents(halaqaId, studentIds) {
  const results = [];
  const errors = [];

  for (const studentId of studentIds) {
    try {
      const r = await enrollStudent(halaqaId, studentId);
      results.push(r);
    } catch (err) {
      errors.push({ student_id: studentId, error: err.message });
    }
  }

  return { enrolled: results, errors };
}

// ── Check if teacher is assigned to halaqa ──────────────────────
async function isTeacherAssigned(halaqaId, teacherId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM halaqa_teachers
     WHERE halaqa_id = $1 AND teacher_id = $2 AND removed_at IS NULL`,
    [halaqaId, teacherId],
  );
  return rows.length > 0;
}

async function isStudentEnrolled(halaqaId, studentId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM halaqa_students
     WHERE halaqa_id = $1 AND student_id = $2 AND left_at IS NULL`,
    [halaqaId, studentId],
  );
  return rows.length > 0;
}

async function listTeacherHalaqaIds(teacherId) {
  const { rows } = await pool.query(
    `SELECT halaqa_id FROM halaqa_teachers
     WHERE teacher_id = $1 AND removed_at IS NULL`,
    [teacherId],
  );
  return rows.map((r) => r.halaqa_id);
}

async function teacherHasStudent(teacherId, studentId) {
  const { rows } = await pool.query(
    `SELECT 1
     FROM halaqa_teachers ht
     JOIN halaqa_students hs
       ON hs.halaqa_id = ht.halaqa_id AND hs.left_at IS NULL
     WHERE ht.teacher_id = $1
       AND ht.removed_at IS NULL
       AND hs.student_id = $2`,
    [teacherId, studentId],
  );
  return rows.length > 0;
}

module.exports = {
  assignTeacher,
  removeTeacher,
  listTeachers,
  enrollStudent,
  withdrawStudent,
  listStudents,
  bulkEnrollStudents,
  isTeacherAssigned,
  isStudentEnrolled,
  teacherHasStudent,
  listTeacherHalaqaIds,
};
