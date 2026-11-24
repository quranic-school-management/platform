import { STATUS, SESSION_STATUS } from './format.js';

const VARIANT = {
  present: 'bg-success-soft text-success',
  late: 'bg-accent text-accent-ink',
  active: 'bg-accent text-accent-ink',
  closed: 'bg-success-soft text-success',
};

const BASE = 'inline-block px-2 rounded-pill text-[0.8125rem] font-medium';

export default function StatusChip({ status }) {
  const variant = VARIANT[status] || 'bg-paper-sunken text-muted';
  return (
    <span className={`${BASE} ${variant}`}>
      {STATUS[status] || SESSION_STATUS[status] || status}
    </span>
  );
}
