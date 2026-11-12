import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetRestaurants } from '../services/api';
import { Icons } from '../components/Icons';

export const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, [search]);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await apiGetRestaurants(search);
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to load restaurants', err);
    } finally {
      setLoading(false);
    }
  };

  const cuisines = [
    { key: 'ALL', label: 'All Cuisines' },
    { key: 'Indian', label: 'Curries & Biryani' },
    { key: 'Burgers', label: 'Burgers & Cafe' },
    { key: 'Asian', label: 'Pan-Asian' },
    { key: 'Pizza', label: 'Pizza & Italian' },
  ];

  const filtered = restaurants.filter((r) => {
    if (selectedCuisine === 'ALL') return true;
    return r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());
  });

  return (
    <div>
      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)',
          color: '#ffffff',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.5px',
              display: 'inline-block',
              marginBottom: '0.75rem',
            }}
          >
            CAMPUS FOOD NETWORK
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Fresh Meals Delivered Across Campus
          </h1>
          <p style={{ opacity: 0.9, fontSize: '1rem', marginBottom: '1.5rem' }}>
            Explore verified eateries, live menu tracking, dummy checkout, and AI order summaries.
          </p>

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              padding: '0.35rem 0.75rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            }}
          >
            <Icons.Search size={20} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by restaurant name, cuisine, or campus location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                padding: '0.65rem 0.75rem',
                width: '100%',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ padding: '4px', color: 'var(--text-muted)' }}
              >
                <Icons.X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.75rem' }}>
        {cuisines.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCuisine(c.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: selectedCuisine === c.key ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: selectedCuisine === c.key ? 'var(--primary-light)' : '#ffffff',
              color: selectedCuisine === c.key ? 'var(--primary)' : 'var(--text-main)',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Restaurant Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <Icons.RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem' }}>Loading campus restaurants...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Icons.Search size={40} color="var(--text-light)" />
          <h3 style={{ marginTop: '1rem', color: 'var(--secondary)' }}>No restaurants found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Try searching for a different dish, cuisine, or clear your search query.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setSearch('');
              setSelectedCuisine('ALL');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filtered.map((rest) => (
            <Link
              to={`/restaurant/${rest.id}`}
              key={rest.id}
              className="card"
              style={{
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', height: 180, width: '100%', background: '#e2e8f0' }}>
                <img
                  src={rest.image}
                  alt={rest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Icons.Star size={14} filled />
                  <span>{rest.rating}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    ({rest.reviewCount})
                  </span>
                </div>
              </div>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.25rem' }}>
                  {rest.name}
                </h3>
                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                  {rest.cuisine}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {rest.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icons.Clock size={14} />
                    <span>{rest.deliveryTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icons.MapPin size={14} />
                    <span>Min ₹{rest.minOrder}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
