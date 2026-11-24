import { NavLink } from 'react-router-dom';
import { NAV } from './navConfig.js';
import { ROLE } from '../components/common/format.js';

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="w-64 shrink-0 bg-brand text-on-brand p-5 flex flex-col gap-4 sticky top-0 h-screen overflow-y-auto max-md:hidden border-l border-brand-rule">
      <div className="font-display font-bold text-3xl">أَتْرُجَة</div>
      <div className="text-xs text-on-brand-muted border-b border-brand-rule pb-2">لوحة {ROLE[user.role]}</div>

      <nav className="flex flex-col gap-1.5 flex-1" aria-label="التنقل الرئيسي">
        {NAV[user.role].map(([to, label, end]) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center px-3.5 py-2.5 rounded-pill text-sm no-underline transition-all
              ${isActive
                ? 'bg-accent text-accent-ink font-semibold shadow-sm'
                : 'text-on-brand hover:bg-brand-hover'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-brand-rule pt-4 flex flex-col gap-3">
        <div className="flex flex-col">
          <b className="font-semibold text-sm text-on-brand truncate">{user.name}</b>
          <span className="text-xs text-on-brand-muted">{ROLE[user.role]}</span>
        </div>
        <button
          type="button"
          className="w-full py-2.5 px-3 rounded-pill bg-[#8a1c14] text-white text-sm font-semibold hover:bg-[#a32219] active:scale-[0.99] transition-all cursor-pointer shadow-sm text-center"
          onClick={onLogout}
        >
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
