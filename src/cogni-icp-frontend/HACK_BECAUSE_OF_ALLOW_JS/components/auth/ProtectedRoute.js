import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../shared';
const ProtectedRoute = ({ adminOnly = false }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return <Loading fullScreen/>;
    }
    if (!user) {
        return <Navigate to="/login" replace/>;
    }
    if (adminOnly && !user.is_admin) {
        return <Navigate to="/dashboard" replace/>;
    }
    return <Outlet />;
};
export default ProtectedRoute;
