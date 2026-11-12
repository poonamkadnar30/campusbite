import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div>
          <h4 style={{ color: 'var(--secondary)', marginBottom: '0.4rem', fontWeight: 800 }}>
            Campus<span style={{ color: 'var(--primary)' }}>Bite</span>
          </h4>
          <p style={{ maxWidth: 380, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Full-stack campus food ordering & delivery platform with role-based access control,
            real-time order lifecycle tracking, dummy payments, and AI-powered order insights.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
          <div>
            <h5 style={{ color: 'var(--secondary)', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
              ROLES & DASHBOARDS
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
              <li><Link to="/customer/dashboard" style={{ color: 'var(--text-muted)' }}>Customer Dashboard</Link></li>
              <li><Link to="/owner/dashboard" style={{ color: 'var(--text-muted)' }}>Restaurant Owner Dashboard</Link></li>
              <li><Link to="/delivery/dashboard" style={{ color: 'var(--text-muted)' }}>Delivery Partner Dashboard</Link></li>
              <li><Link to="/customer/insights" style={{ color: 'var(--text-muted)' }}>Applied AI Order Insights</Link></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: 'var(--secondary)', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
              TECH STACK
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <li>Frontend: React.js & React Router</li>
              <li>Backend: FastAPI & Python</li>
              <li>Database: Relational SQL & SQLAlchemy</li>
              <li>Container: Docker & Compose</li>
            </ul>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '1.5rem auto 0 auto', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-light)' }}>
        © {new Date().getFullYear()} CampusBite Capstone Project. Designed for Evaluation & Demonstration.
      </div>
    </footer>
  );
};
