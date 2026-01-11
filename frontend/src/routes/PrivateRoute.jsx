import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false, employeeOnly = false }) => {
    const { isAuthenticated, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                <div className="spinner spinner-lg" />
                <span style={{ color: 'var(--gray-500)' }}>Loading...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin()) {
        return (
            <div className="page-container">
                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <h2 style={{ color: 'var(--error-600)', marginBottom: '1rem' }}>Access Denied</h2>
                        <p style={{ color: 'var(--gray-600)' }}>
                            You don't have permission to view this page. Please contact your administrator.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (employeeOnly && isAdmin()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
