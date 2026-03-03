import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const rawUser = sessionStorage.getItem('user');

  if (!rawUser) {
    return <Navigate to="/login" replace />;
  }

  let parsedUser;
  try {
    parsedUser = JSON.parse(rawUser);
  } catch {
    sessionStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(parsedUser?.role)) {
    const fallbackPath = parsedUser?.role === 'resident' ? '/resident/dashboard' : '/admin/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}