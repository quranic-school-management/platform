const enrollmentService = require('../services/enrollmentService');
const { requireFields, requireUUID } = require('../helpers/validators');
const { assertCanAccessHalaqa } = require('../helpers/accessControl');

// ── Teachers ────────────────────────────────────────────────────
async function assignTeacher(req, res) {
  requireUUID(req.params.halaqaId, 'halaqaId');
  const { teacher_id } = requireFields(req.body, ['teacher_id']);
  requireUUID(teacher_id, 'teacher_id');

  const result = await enrollmentService.assignTeacher(req.params.halaqaId, teacher_id);
  res.status(201).json({ data: result });
}

async function removeTeacher(req, res) {
  requireUUID(req.params.halaqaId, 'halaqaId');
  requireUUID(req.params.teacherId, 'teacherId');

  const result = await enrollmentService.removeTeacher(req.params.halaqaId, req.params.teacherId);
  res.json({ data: { message: 'Teacher removed', ...result } });
}

async function listTeachers(req, res) {
  requireUUID(req.params.halaqaId, 'halaqaId');
  await assertCanAccessHalaqa(req.user, req.params.halaqaId);
  const teachers = await enrollmentService.listTeachers(req.params.halaqaId);
  res.json({ data: teachers });
}

// ── Students ────────────────────────────────────────────────────
async function enrollStudent(req, res) {
  requireUUID(req.params.halaqaId, 'halaqaId');
  const { student_id } = requireFields(req.body, ['student_id']);
  requireUUID(student_id, 'student_id');

  const result = await enrollmentService.enrollStudent(req.params.halaqaId, student_id);
  res.status(201).json({ data: result });
}

async function withdrawStudent(req, res) {
  requireUUID(req.params.halaqaId, 'halaqaId');
  requireUUID(req.params.studentId, 'studentId');

  const result = await enrollmentService.withdrawStudent(req.params.halaqaId, req.params.studentId);
  res.json({ data: { message: 'Student withdrawn', ...result } });
}

async function listStudents(req, res) {
  requireUUID(req.params.halaqaId, 'halaqaId');
  await assertCanAccessHalaqa(req.user, req.params.halaqaId);
  const students = await enrollmentService.listStudents(req.params.halaqaId);
  res.json({ data: students });
}

async function bulkEnroll(req, res) {
  requireUUID(req.params.halaqaId, 'halaqaId');
  const { student_ids } = requireFields(req.body, ['student_ids']);
  if (!Array.isArray(student_ids) || student_ids.length === 0) {
    throw new (require('../helpers/AppError'))('student_ids must be a non-empty array', 400);
  }
  student_ids.forEach((id) => requireUUID(id, 'student_id'));

  const result = await enrollmentService.bulkEnrollStudents(req.params.halaqaId, student_ids);
  res.status(201).json({ data: result });
}

module.exports = {
  assignTeacher,
  removeTeacher,
  listTeachers,
  enrollStudent,
  withdrawStudent,
  listStudents,
  bulkEnroll,
};
