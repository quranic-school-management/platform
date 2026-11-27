import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext.jsx";
import * as auth from "../api/authService.js";
import Field from "../components/common/Field.jsx";
import { Loading } from "../components/common/States.jsx";
import { MIN_PASSWORD_LENGTH, ROLE_HOME } from "../components/common/format.js";

export default function ChangePassword() {
  const { user, loading, refreshUser } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ current: "", newPwd: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.must_change_password)
    return <Navigate to={ROLE_HOME[user.role]} replace />;

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (!f.current) er.current = "أدخل كلمة المرور الحالية";
    if (!f.newPwd || f.newPwd.length < MIN_PASSWORD_LENGTH) {
      er.newPwd = `كلمة المرور الجديدة يجب أن تكون ${MIN_PASSWORD_LENGTH} أحرف على الأقل`;
    }
    if (f.newPwd !== f.confirm) er.confirm = "كلمتا المرور غير متطابقتين";
    if (f.newPwd === f.current && f.current)
      er.newPwd = "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية";
    setErrors(er);
    setError("");
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await auth.changePassword(f.current, f.newPwd);
      await refreshUser();
      nav(ROLE_HOME[user.role], { replace: true });
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
      aria-label="تغيير كلمة المرور"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-semibold mb-2">
          تغيير كلمة المرور
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          يجب تغيير كلمة المرور الافتراضية قبل استخدام النظام.
        </p>
      </div>

      {error && (
        <p
          className="text-danger bg-danger-soft border border-danger rounded-pill py-2.5 px-3.5 text-sm font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <Field
          id="current-pwd"
          label="كلمة المرور الحالية"
          type="password"
          autoComplete="current-password"
          value={f.current}
          error={errors.current}
          onChange={(e) => setF({ ...f, current: e.target.value })}
        />
        <Field
          id="new-pwd"
          label="كلمة المرور الجديدة"
          type="password"
          autoComplete="new-password"
          value={f.newPwd}
          error={errors.newPwd}
          onChange={(e) => setF({ ...f, newPwd: e.target.value })}
        />
        <Field
          id="confirm-pwd"
          label="تأكيد كلمة المرور الجديدة"
          type="password"
          autoComplete="new-password"
          value={f.confirm}
          error={errors.confirm}
          onChange={(e) => setF({ ...f, confirm: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full text-base font-semibold"
        disabled={busy}
      >
        {busy ? "جارٍ التغيير…" : "تغيير كلمة المرور"}
      </button>
    </form>
  );
}
