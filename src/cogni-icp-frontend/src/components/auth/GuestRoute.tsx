import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../shared';

const GuestRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
        return <Loading />;
  }

    if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute; 