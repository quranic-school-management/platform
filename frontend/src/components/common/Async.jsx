import { Navigate } from 'react-router-dom';
import { Empty, ErrorState, Loading } from './States.jsx';

/** Renders loading / error / empty states, and handles auth-related error redirects. */
export default function Async({ state, children }) {
  const { data, loading, error, reload } = state;
  if (loading) return <Loading />;
  if (error?.status === 401) return <Navigate to="/login" replace />;
  if (error?.status === 403) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('change') && msg.includes('password')) return <Navigate to="/change-password" replace />;
    return <Navigate to="/unauthorized" replace />;
  }
  if (error?.status === 404) return <Empty title="غير موجود">{error.message}</Empty>;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return children(data);
}
