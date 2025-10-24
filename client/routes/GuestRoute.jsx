import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';

export default function GuestRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  setTimeout(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      return <Navigate to={from} replace />;
    }
  }, 2500);

  return <Outlet />;
}
