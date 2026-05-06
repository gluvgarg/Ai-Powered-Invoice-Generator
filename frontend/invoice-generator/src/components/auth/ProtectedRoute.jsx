import { Navigate, Outlet } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2a5a]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <DashboardLayout>{children ? children : <Outlet />}</DashboardLayout>
  )
}

export default ProtectedRoute
