// [path, label, exact match, short label for the phone tab bar]
export const NAV = {
  mushrif: [
    ['/mushrif', 'لوحة المتابعة', true, 'الرئيسية'],
    ['/mushrif/halaqat', 'إدارة الحلقات', false, 'الحلقات'],
    ['/mushrif/users', 'إدارة المستخدمين', false, 'المستخدمون'],
    ['/mushrif/attendance', 'الحضور', false, 'الحضور'],
    ['/mushrif/activity', 'الحفظ والمراجعة', false, 'الحفظ'],
    ['/mushrif/reports', 'كشف النقاط', false, 'الكشوف'],
  ],
  teacher: [
    ['/teacher', 'لوحة المتابعة', true, 'الرئيسية'],
    ['/teacher/halaqat', 'حلقاتي', false, 'حلقاتي'],
    ['/teacher/session', 'مساحة الجلسة', false, 'الجلسة'],
    ['/teacher/history', 'سجل الطلاب', false, 'السجل'],
  ],
  student: [
    ['/student', 'نظرة عامة', true, 'نظرة عامة'],
    ['/student/logs', 'السجل اليومي', false, 'السجل'],
    ['/student/reports', 'كشف النقاط', false, 'الكشوف'],
  ],
};
