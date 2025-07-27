import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
const NotFound = () => {
    const { user } = useAuth();
    return user ? <Navigate to="/dashboard" replace/> : <Navigate to="/" replace/>;
};
export default NotFound;
