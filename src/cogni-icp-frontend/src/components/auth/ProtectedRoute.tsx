import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../shared';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
        return <Loading />;
  }

    if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

    // This is a placeholder for admin check, will need adjustment based on final User type
    // if (adminOnly && user?.role !== 'admin') {
    //     return <Navigate to="/dashboard" replace />;
    // }

  return <Outlet />;
};

export default ProtectedRoute; 