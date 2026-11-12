import React from 'react';
import { Icons } from './Icons';
import { useCart } from '../context/CartContext';

export const DishCard = ({ dish, restaurant, onAddSuccess }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const cartEntry = cartItems.find((item) => item.id === dish.id);
  const quantity = cartEntry ? cartEntry.quantity : 0;

  const handleAdd = () => {
    if (!dish.is_available) return;
    const ok = addToCart(dish, restaurant);
    if (ok && onAddSuccess) {
      onAddSuccess(dish);
    }
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.25rem',
        opacity: dish.is_available ? 1 : 0.65,
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', background: '#f1f5f9' }}>
        <img
          src={dish.image}
          alt={dish.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
          }}
        />
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <span
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {dish.category}
          </span>
        </div>
        {!dish.is_available && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            Sold Out / Unavailable
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.35rem' }}>
          {dish.name}
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {dish.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            ₹{dish.price}
          </div>

          <div>
            {!dish.is_available ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600 }}>Unavailable</span>
            ) : quantity > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', padding: '2px 4px', border: '1px solid var(--primary)' }}>
                <button
                  onClick={() => updateQuantity(dish.id, quantity - 1)}
                  style={{ padding: '4px 8px', color: 'var(--primary)' }}
                  aria-label="Decrease quantity"
                >
                  <Icons.Minus size={14} />
                </button>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', padding: '0 8px', color: 'var(--primary)' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(dish.id, quantity + 1)}
                  style={{ padding: '4px 8px', color: 'var(--primary)' }}
                  aria-label="Increase quantity"
                >
                  <Icons.Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleAdd}
              >
                <Icons.Plus size={15} />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
