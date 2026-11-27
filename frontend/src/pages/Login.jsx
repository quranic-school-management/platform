import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';
import Field from '../components/common/Field.jsx';
import { ROLE_HOME } from '../components/common/format.js';

export default function Login() {
  const { user, login } = useAuth();
  const loc = useLocation();
  const [f, setF] = useState({ username: '', password: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    if (user.must_change_password) return <Navigate to="/change-password" replace />;
    const from = loc.state?.from;
    return <Navigate to={from && from.startsWith(ROLE_HOME[user.role]) ? from : ROLE_HOME[user.role]} replace />;
  }

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (!f.username.trim()) er.username = 'أدخل اسم المستخدم';
    if (!f.password) er.password = 'أدخل كلمة المرور';
    setErrors(er); setError('');
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await login(f.username.trim(), f.password);
    } catch (x) {
      setError(x.message);
      setBusy(false);
    }
  }

  return (
    <form
      className="w-full bg-paper-elevated rounded-card shadow-card p-6 sm:p-8 border border-rule flex flex-col gap-6"
      noValidate
      onSubmit={submit}
      aria-label="نموذج تسجيل الدخول"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-semibold mb-2">تسجيل الدخول</h1>
        <p className="text-muted text-sm leading-relaxed">أدخل اسم المستخدم وكلمة المرور اللذين سلّمهما لك المشرف.</p>
      </div>

      {error && (
        <p className="text-danger bg-danger-soft border border-danger rounded-pill py-2.5 px-3.5 text-sm font-medium" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <Field
          id="username"
          label="اسم المستخدم"
          dir="ltr"
          autoComplete="username"
          value={f.username}
          error={errors.username}
          onChange={(e) => setF({ ...f, username: e.target.value })}
        />

        <div className={`relative ${errors.password ? 'field-error' : ''}`}>
          <label htmlFor="password" className="absolute start-3 top-1.5 text-xs font-medium text-muted pointer-events-none">كلمة المرور</label>
          <input
            id="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            value={f.password}
            aria-invalid={errors.password ? 'true' : undefined}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            className="w-full h-12 pt-5 pb-1 px-3 pe-16 bg-paper-elevated border border-muted rounded-pill text-ink focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent text-sm"
          />
          <button
            type="button"
            className="absolute end-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium text-muted hover:text-ink transition-colors cursor-pointer"
            aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            onClick={() => setShow((s) => !s)}
          >
            {show ? 'إخفاء' : 'إظهار'}
          </button>
          {errors.password && <small className="block text-danger text-xs mt-1" role="alert">{errors.password}</small>}
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full text-base font-semibold" disabled={busy}>
        {busy ? 'جارٍ الدخول…' : 'تسجيل الدخول'}
      </button>
    </form>
  );
}
