import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'customer') navigate('/customer/dashboard');
    else if (role === 'restaurant_owner') navigate('/owner/dashboard');
    else if (role === 'delivery_partner') navigate('/delivery/dashboard');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const loggedUser = await login(email, password);
      redirectAfterLogin(loggedUser.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    try {
      const loggedUser = await login(demoEmail, demoPass);
      redirectAfterLogin(loggedUser.role);
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-full)', marginBottom: '0.75rem' }}>
            <Icons.User size={32} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>Welcome to CampusBite</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in with your campus role account</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <Icons.AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. customer@campusbite.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', textAlign: 'center' }}>
            ⚡ Instant 1-Click Demo Login
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.55rem 0.85rem' }}
              onClick={() => handleQuickLogin('customer@campusbite.com', 'pass123')}
            >
              <span>👤 <strong>Aarav Sharma</strong> (Customer)</span>
              <Icons.ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.55rem 0.85rem' }}
              onClick={() => handleQuickLogin('owner@campusbite.com', 'pass123')}
            >
              <span>🍳 <strong>Priya Patel</strong> (Restaurant Owner)</span>
              <Icons.ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.55rem 0.85rem' }}
              onClick={() => handleQuickLogin('delivery@campusbite.com', 'pass123')}
            >
              <span>🛵 <strong>Rohan Verma</strong> (Delivery Partner)</span>
              <Icons.ArrowRight size={14} />
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account yet? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};
