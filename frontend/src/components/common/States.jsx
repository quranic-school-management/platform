export function Loading() {
  return (
    <div className="bg-paper-elevated border border-rule rounded-card p-4 overflow-x-auto" aria-busy="true" role="status">
      <p className="text-[0.8125rem] text-muted">جارٍ التحميل…</p>
      <div className="grid gap-4 py-4">
        {[70, 45, 60, 52].map((w) => (
          <div key={w} className="h-4 rounded bg-paper-sunken" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="grid gap-2 justify-items-center p-8 border border-dashed border-muted rounded-card text-center">
      {title && <h3>{title}</h3>}
      {children && <p className="text-muted">{children}</p>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="grid gap-2 justify-items-center p-8 border border-dashed border-muted rounded-card text-center" role="alert">
      <h3>تعذّر تحميل البيانات</h3>
      <p className="text-muted">{error?.message || 'تحقق من الاتصال ثم أعد المحاولة.'}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
