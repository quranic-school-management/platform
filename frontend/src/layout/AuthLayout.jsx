import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper text-ink" dir="rtl">
      {/* Brand panel — desktop only */}
      <div className="hidden md:flex md:w-1/2 shrink-0 bg-brand text-on-brand p-8 lg:p-14 flex-col justify-between">
        <div className="font-display font-bold text-6xl lg:text-7xl leading-tight">أَتْرُجَة</div>
        <div className="space-y-6">
          <p className="font-display font-semibold text-2xl lg:text-3xl leading-relaxed text-on-brand">
            سجلٌّ واحد منظَّم لحلقات القرآن: الحضور والحفظ والمراجعة.
          </p>
          <ul className="space-y-3 border-t border-brand-rule pt-4 text-on-brand-muted text-base lg:text-lg">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent shrink-0"></span>
              <span>المشرف: الحلقات والحسابات وكشف النقاط</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent shrink-0"></span>
              <span>المعلّم: الحضور والحفظ والمراجعة</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent shrink-0"></span>
              <span>الطالب وولي الأمر: التقدم والسجل اليومي</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-[28rem]">
          <div className="block md:hidden font-display font-bold text-3xl text-center text-brand mb-6">أَتْرُجَة</div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
