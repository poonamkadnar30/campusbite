import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';

export const Cart = () => {
  const { cartItems, restaurant, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, taxes, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center' }} className="card">
        <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--primary-light)', borderRadius: 'var(--radius-full)', marginBottom: '1rem' }}>
          <Icons.ShoppingCart size={40} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
          Your Cart is Empty
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Looks like you haven't added anything to your cart yet. Explore food from campus eateries!
        </p>
        <Link to="/" className="btn btn-primary" style={{ margin: '0 auto' }}>
          Explore Campus Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>Your Cart</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Ordering from <strong>{restaurant?.name}</strong>
          </p>
        </div>
        <button
          onClick={clearCart}
          className="btn btn-secondary btn-sm"
          style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
        >
          <Icons.Trash2 size={14} />
          <span>Clear Cart</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
        {/* Cart Item List */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '2px' }}>
                    {item.name}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ₹{item.price} each
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: 'var(--radius-md)', padding: '2px 4px' }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{ padding: '4px 6px' }}
                  >
                    <Icons.Minus size={13} />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', padding: '0 8px' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ padding: '4px 6px' }}
                  >
                    <Icons.Plus size={13} />
                  </button>
                </div>

                <div style={{ width: 70, textAlign: 'right', fontWeight: 800, color: 'var(--secondary)' }}>
                  ₹{item.price * item.quantity}
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ color: 'var(--text-light)', padding: '4px' }}
                  title="Remove item"
                >
                  <Icons.Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Link
              to={`/restaurant/${restaurant?.id}`}
              style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Icons.Plus size={14} />
              <span>Add more items from {restaurant?.name}</span>
            </Link>
          </div>
        </div>

        {/* Bill Summary */}
        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1.25rem' }}>
              Order Bill Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Item Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery Partner Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Campus Taxes & Platform (5%)</span>
                <span>₹{taxes}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  color: 'var(--secondary)',
                  paddingTop: '0.75rem',
                  borderTop: '2px dashed var(--border)',
                }}
              >
                <span>To Pay</span>
                <span style={{ color: 'var(--primary)' }}>₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: { pathname: '/checkout' } } });
                } else {
                  navigate('/checkout');
                }
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <span>Proceed to Checkout</span>
              <Icons.ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
