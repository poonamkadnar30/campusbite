import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGetRestaurantById, apiGetMenuItems } from '../services/api';
import { DishCard } from '../components/DishCard';
import { Icons } from '../components/Icons';
import { useCart } from '../context/CartContext';

export const RestaurantMenu = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [priceFilter, setPriceFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const { cartCount, subtotal, restaurant: cartRestaurant } = useCart();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const rest = await apiGetRestaurantById(id);
      const items = await apiGetMenuItems(id);
      setRestaurant(rest);
      setMenuItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDishAdded = (dish) => {
    setToastMessage(`Added "${dish.name}" to cart`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        <Icons.RefreshCw size={36} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem' }}>Loading restaurant menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Restaurant not found</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const categories = ['ALL', ...new Set(menuItems.map((m) => m.category))];

  const filteredItems = menuItems.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    let matchPrice = true;
    if (priceFilter === 'UNDER_150') matchPrice = item.price < 150;
    else if (priceFilter === '150_250') matchPrice = item.price >= 150 && item.price <= 250;
    else if (priceFilter === 'ABOVE_250') matchPrice = item.price > 250;

    return matchSearch && matchCategory && matchPrice;
  });

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast success">
            <Icons.CheckCircle size={20} color="var(--success)" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Restaurant Header Banner */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <img
          src={restaurant.image}
          alt={restaurant.name}
          style={{
            width: 120,
            height: 120,
            borderRadius: 'var(--radius-md)',
            objectFit: 'cover',
          }}
        />

        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
              {restaurant.name}
            </h1>
            <div
              style={{
                background: '#fef3c7',
                color: '#b45309',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Icons.Star size={14} filled />
              <span>{restaurant.rating}</span>
              <span style={{ fontSize: '0.75rem', color: '#92400e' }}>({restaurant.reviewCount} reviews)</span>
            </div>
          </div>

          <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
            {restaurant.cuisine}
          </p>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <Icons.MapPin size={14} style={{ marginRight: 4 }} />
            {restaurant.address}
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div>
              <strong>Delivery:</strong> {restaurant.deliveryTime}
            </div>
            <div>
              <strong>Min Order:</strong> ₹{restaurant.minOrder}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.75rem', width: '100%', maxWidth: 360 }}>
          <Icons.Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search dishes by name or ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', padding: '0.4rem 0.5rem', width: '100%', fontSize: '0.9rem' }}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <Icons.X size={16} color="var(--text-muted)" />
            </button>
          )}
        </div>

        {/* Price Filter dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Price Filter:
          </span>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.88rem' }}
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option value="ALL">All Prices</option>
            <option value="UNDER_150">Under ₹150</option>
            <option value="150_250">₹150 - ₹250</option>
            <option value="ABOVE_250">Above ₹250</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.75rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: selectedCategory === cat ? 'var(--primary-light)' : '#ffffff',
              color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-main)',
              whiteSpace: 'nowrap',
            }}
          >
            {cat === 'ALL' ? '🍽️ All Dishes' : cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Icons.Search size={36} color="var(--text-light)" />
          <h4 style={{ marginTop: '0.75rem', color: 'var(--secondary)' }}>No dishes match your filter</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try clearing your search or price criteria.</p>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.75rem' }}
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
              setPriceFilter('ALL');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredItems.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              restaurant={restaurant}
              onAddSuccess={handleDishAdded}
            />
          ))}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <aside
          aria-label="Cart summary"
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: 600,
            background: 'var(--secondary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 40,
            animation: 'modalFadeIn 0.2s ease-out',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              {cartCount} item{cartCount > 1 ? 's' : ''} in cart • ₹{subtotal}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              From {cartRestaurant?.name || restaurant.name}
            </div>
          </div>
          <Link
            to="/cart"
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 700, padding: '0.5rem 1rem' }}
          >
            <span>View Cart</span>
            <Icons.ArrowRight size={15} />
          </Link>
        </aside>
      )}
    </div>
  );
};
