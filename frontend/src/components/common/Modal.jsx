import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ title, onClose, children, actions }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center p-6 max-md:place-items-end max-md:p-0"
      style={{ background: 'rgba(5,38,26,.6)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-paper-elevated border border-rule rounded-entry shadow-card p-6 max-w-lg w-full grid gap-4 focus:outline-none max-md:rounded-b-none max-md:max-w-none max-md:border-x-0 max-md:border-b-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        tabIndex={-1}
        ref={ref}
      >
        <h2 id="dlg-title">{title}</h2>
        {children}
        {actions && <div className="flex flex-wrap gap-4 items-end">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}
