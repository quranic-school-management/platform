const ROLES = Object.freeze({
  MUSHRIF: 'mushrif',
  TEACHER: 'teacher',
  STUDENT: 'student',
});

const ALL_ROLES = Object.values(ROLES);

const QMS_EMAIL_DOMAIN = 'qms.local';
const JWT_EXPIRES_IN = '8h';
const SUPABASE_INSTANCE_ID = '00000000-0000-0000-0000-000000000000';
const MIN_PASSWORD_LENGTH = 8;

module.exports = {
  ROLES,
  ALL_ROLES,
  QMS_EMAIL_DOMAIN,
  JWT_EXPIRES_IN,
  SUPABASE_INSTANCE_ID,
  MIN_PASSWORD_LENGTH,
};
