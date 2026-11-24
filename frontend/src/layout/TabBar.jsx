import { NavLink } from 'react-router-dom';
import { NAV } from './navConfig.js';

/** Phone bottom tab bar. */
export default function TabBar({ role }) {
  return (
    <nav
      className="hidden max-md:grid fixed bottom-0 inset-x-0 z-10 grid-flow-col auto-cols-fr gap-1 p-2 bg-paper-sunken border-t border-ink"
      aria-label="التنقل السفلي"
    >
      {NAV[role].map(([to, , end, short]) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `grid place-items-center text-center min-h-13 px-1 rounded-pill no-underline text-[0.8125rem] font-medium transition-colors
            ${isActive ? 'bg-accent text-accent-ink' : ''}`
          }
        >
          {short}
        </NavLink>
      ))}
    </nav>
  );
}
