import { ROLE } from '../components/common/format.js';

/** Phone app bar (hidden on larger screens). */
export default function Header({ user, onAccount }) {
  const initial = user.name.replace(/^الأستاذ\s+/, '').trim()[0];
  return (
    <header className="hidden max-md:flex items-center justify-between gap-2 py-3 px-4 bg-brand text-on-brand sticky top-0 z-10">
      <div>
        <div className="font-display font-semibold text-2xl">أَتْرُجَة</div>
        <span className="text-on-brand-muted text-sm">{ROLE[user.role]}</span>
      </div>
      <button
        type="button"
        className="w-11 h-11 rounded-pill border border-ink bg-paper-elevated font-semibold cursor-pointer text-ink"
        aria-label="الحساب"
        onClick={onAccount}
      >
        {initial}
      </button>
    </header>
  );
}
