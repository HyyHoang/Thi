import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AccessDenied from './AccessDenied';
import { User } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: number[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const token = localStorage.getItem('access_token');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        let user: User | null = null;
        try {
            user = JSON.parse(localStorage.getItem('user') || 'null') as User | null;
        } catch {
            user = null;
        }
        const role = user?.role;
        if (role === undefined || !allowedRoles.includes(role)) {
            return <AccessDenied />;
        }
    }

    return <>{children}</>;
}

export default ProtectedRoute;
