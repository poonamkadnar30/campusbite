import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiCreateOrder } from '../services/api';
import { Icons } from '../components/Icons';

export const Checkout = () => {
  const { cartItems, restaurant, subtotal, deliveryFee, taxes, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || 'Hostel Block 4, Room 302, Campus North');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('DUMMY_CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center' }} className="card">
        <h3>No items in cart</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Explore Restaurants
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      setError('Please provide a complete delivery address and phone number.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const orderPayload = {
        customerId: user?.id || 1,
        customerName: user?.name || 'Aarav Sharma',
        customerPhone: phone,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        deliveryFee,
        taxes,
        total,
        deliveryAddress: address,
        notes: instructions,
        paymentStatus: 'mock_paid', // Dummy payment per PRD section 5
      };

      const createdOrder = await apiCreateOrder(orderPayload);
      clearCart();
      navigate('/customer/dashboard', {
        state: { newOrderId: createdOrder.id, message: 'Order placed successfully!' },
      });
    } catch (err) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1.5rem' }}>
        Checkout & Dummy Payment
      </h1>

      {error && (
        <div className="alert alert-danger">
          <Icons.AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: Delivery & Payment Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Delivery Address Card */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icons.MapPin size={18} color="var(--primary)" />
                <span>1. Delivery Destination</span>
              </h3>

              <div className="form-group">
                <label className="form-label">Campus Delivery Address (Hostel, Room, Lab)</label>
                <input
                  type="text"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Hostel Block 4, Room 302"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Drop-off Instructions (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Leave with hostel guard"
                  />
                </div>
              </div>
            </div>

            {/* Dummy Payment Card (PRD Requirement) */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icons.DollarSign size={18} color="var(--primary)" />
                <span>2. Dummy Payment Method</span>
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                In accordance with CampusBite PRD Section 5, this environment utilizes a <strong>Mock Payment System</strong>. No real credit card or bank credentials are required.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'DUMMY_CARD' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: paymentMethod === 'DUMMY_CARD' ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'DUMMY_CARD'}
                    onChange={() => setPaymentMethod('DUMMY_CARD')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      💳 Mock Campus Smart Card / Instant Pay
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Simulated instant payment. Sets status to <code style={{ color: 'var(--primary)' }}>mock_paid</code> upon submission.
                    </div>
                  </div>
                  <span className="role-badge customer">Simulated</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'DUMMY_UPI' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: paymentMethod === 'DUMMY_UPI' ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'DUMMY_UPI'}
                    onChange={() => setPaymentMethod('DUMMY_UPI')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      📱 Mock Campus UPI QR
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Simulates instant scan & pay verification.
                    </div>
                  </div>
                  <span className="role-badge customer">Simulated</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Button */}
          <div>
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: 90 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1rem' }}>
                Order Summary
              </h3>

              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                {restaurant?.name}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 180, overflowY: 'auto', marginBottom: '1rem', paddingRight: '4px' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-main)' }}>
                      {item.quantity}x {item.name}
                    </span>
                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Taxes (5%)</span>
                  <span>₹{taxes}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    color: 'var(--secondary)',
                    paddingTop: '0.75rem',
                    borderTop: '2px dashed var(--border)',
                  }}
                >
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--primary)' }}>₹{total}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Processing Dummy Payment...</span>
                ) : (
                  <span>Confirm & Place Order (₹{total})</span>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-light)' }}>
                🔒 100% Secure Campus Sandbox Checkout
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
