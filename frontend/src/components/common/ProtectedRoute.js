import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../../../prueba/futbol-dashboard/frontend/src/services/authService';

const ProtectedRoute = () => {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;