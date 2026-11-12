import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    restaurantName: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      const user = await register(formData);
      if (user.role === 'customer') navigate('/customer/dashboard');
      else if (user.role === 'restaurant_owner') navigate('/owner/dashboard');
      else if (user.role === 'delivery_partner') navigate('/delivery/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-full)', marginBottom: '0.75rem' }}>
            <Icons.User size={32} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>Create CampusBite Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose your role to get started</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <Icons.AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Your Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { key: 'customer', label: 'Customer', icon: '👤' },
                { key: 'restaurant_owner', label: 'Owner', icon: '🍳' },
                { key: 'delivery_partner', label: 'Delivery', icon: '🛵' },
              ].map((roleOpt) => (
                <button
                  type="button"
                  key={roleOpt.key}
                  onClick={() => setFormData((p) => ({ ...p, role: roleOpt.key }))}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: formData.role === roleOpt.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: formData.role === roleOpt.key ? 'var(--primary-light)' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: formData.role === roleOpt.key ? 'var(--primary)' : 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{roleOpt.icon}</span>
                  <span>{roleOpt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {formData.role === 'restaurant_owner' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="restaurantName">Restaurant Name</label>
                <input
                  id="restaurantName"
                  type="text"
                  name="restaurantName"
                  className="form-control"
                  placeholder="e.g. Campus Spice Hub"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={120}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="name@campus.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min 6 characters)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {formData.role === 'customer'
                ? 'Delivery Address / Hostel & Room'
                : formData.role === 'restaurant_owner'
                ? 'Restaurant Location'
                : 'Campus Base Area'}
            </label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="e.g. Hostel Block 4, Room 302"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};
