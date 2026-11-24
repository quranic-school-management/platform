/** Segmented control. options: [[value, label], ...] */
export default function Seg({ value, onChange, options, label }) {
  return (
    <div
      className="inline-flex border border-rule rounded-pill overflow-hidden bg-paper-elevated"
      role="group"
      aria-label={label}
    >
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`min-h-10 px-3.5 border-0 cursor-pointer transition-colors
            ${value === v
              ? 'bg-accent text-accent-ink font-medium'
              : 'bg-transparent hover:bg-paper-sunken'
            }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
