import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';

export default function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yüklənir...
      </div>
    );
  }

  if (isAuthenticated) {
    // artıq login olubsa, geri istiqamətləndir
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
