const L = 'ar-DZ-u-nu-latn'; // Arabic, Latin digits (1, 2, 3)
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(L, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—');
export const fmtLongDate = (d = new Date()) => d.toLocaleDateString(L, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
export const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString(L, { hour: '2-digit', minute: '2-digit', hour12: false }) : '—');
export const STATUS = { present: 'حاضر', absent: 'غائب', not_recorded: 'لم يُسجَّل' };
export const TYPE = { hifz: 'حفظ', murajaa: 'مراجعة' };
export const SESSION_STATUS = { active: 'جارية', completed: 'منتهية', abandoned: 'ملغاة' };
export const ROLE = { mushrif: 'المشرف', teacher: 'المعلّم', student: 'الطالب' };
export const ROLE_HOME = { mushrif: '/mushrif', teacher: '/unauthorized', student: '/unauthorized' };
