import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';

export default function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center  px-4">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // yalnız login-ə burax
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
