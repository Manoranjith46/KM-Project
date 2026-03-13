import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  // Show nothing while checking auth state
  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on role
    if (user?.role === 'owner' || user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      // resident, guest, or other → resident pages
      return <Navigate to="/resident/dashboard" replace />;
    }
  }

  return children;
}
