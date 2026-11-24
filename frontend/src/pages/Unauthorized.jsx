import { Link } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';
import { ROLE_HOME } from '../components/common/format.js';

export default function Unauthorized() {
  const { user } = useAuth();
  return (
    <div className="grid gap-4 justify-items-center text-center py-8">
      <h1>غير مصرّح بالوصول</h1>
      <p className="text-muted">ليست لديك صلاحية لعرض هذه الصفحة.</p>
      <Link className="btn btn-primary no-underline grid place-items-center" to={user ? ROLE_HOME[user.role] : '/login'}>
        {user ? 'العودة إلى لوحتي' : 'تسجيل الدخول'}
      </Link>
    </div>
  );
}
