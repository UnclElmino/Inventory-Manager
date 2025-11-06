import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, checking } = useAuth();
  if (checking) return <div className="container py-5">Loading…</div>;
  return user ? <Outlet /> : <Navigate to="/" replace />;
}
