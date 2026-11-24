import { Link } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';
import { ROLE_HOME } from '../components/common/format.js';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="grid gap-4 justify-items-center text-center py-8">
      <h1>الصفحة غير موجودة</h1>
      <p className="text-muted">تحقق من الرابط أو عد إلى الصفحة الرئيسية.</p>
      <Link className="btn btn-primary no-underline grid place-items-center" to={user ? ROLE_HOME[user.role] : '/login'}>
        {user ? 'العودة إلى لوحتي' : 'تسجيل الدخول'}
      </Link>
    </div>
  );
}
