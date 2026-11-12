import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }} className="card">
        <Icons.ShieldCheck size={48} color="var(--danger)" />
        <h2 style={{ margin: '1rem 0 0.5rem 0' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your current account role (<strong>{user.role}</strong>) does not have permission to view this page.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (user.role === 'customer') window.location.href = '/customer/dashboard';
            else if (user.role === 'restaurant_owner') window.location.href = '/owner/dashboard';
            else if (user.role === 'delivery_partner') window.location.href = '/delivery/dashboard';
            else window.location.href = '/';
          }}
        >
          Go to Your Dashboard
        </button>
      </div>
    );
  }

  return children;
};
