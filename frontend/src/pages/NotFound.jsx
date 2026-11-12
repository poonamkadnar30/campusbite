import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

export const NotFound = () => {
  return (
    <div style={{ maxWidth: 480, margin: '4rem auto', textAlign: 'center' }} className="card">
      <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-full)', marginBottom: '1rem' }}>
        <Icons.AlertTriangle size={48} color="var(--danger)" />
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        The campus page or resource you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary" style={{ margin: '0 auto' }}>
        Back to Home
      </Link>
    </div>
  );
};
