import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../api/AuthContext.jsx';
import { Loading } from '../common/States.jsx';

/** UI-level guard only. The backend must enforce the same rules (see backend/README.md). */
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (user.must_change_password) return <Navigate to="/change-password" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}
