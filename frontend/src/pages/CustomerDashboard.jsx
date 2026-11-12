import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  apiGetOrders,
  apiCancelOrder,
  apiSubmitReview,
  apiRequestReturn,
} from '../services/api';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderTracker } from '../components/OrderTracker';
import { ReviewModal } from '../components/ReviewModal';
import { ReturnRequestModal } from '../components/ReturnRequestModal';
import { Icons } from '../components/Icons';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [toastMessage, setToastMessage] = useState(location.state?.message || '');

  // Modals state
  const [reviewOrder, setReviewOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadOrders();
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiGetOrders({ customerId: user.id });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const confirm = window.confirm(
      'Are you sure you want to cancel Order #' + orderId + '? Cancellation is only permitted in PLACED status.'
    );
    if (!confirm) return;

    setCancellingId(orderId);
    try {
      await apiCancelOrder(orderId);
      setToastMessage('Order #' + orderId + ' has been cancelled.');
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReviewSubmit = async (orderId, reviewData) => {
    await apiSubmitReview(orderId, reviewData);
    setToastMessage('Thank you! Your review for Order #' + orderId + ' was submitted.');
    await loadOrders();
  };

  const handleReturnSubmit = async (orderId, reason) => {
    await apiRequestReturn(orderId, reason);
    setToastMessage('Refund request for Order #' + orderId + ' sent to restaurant manager.');
    await loadOrders();
  };

  // Filtering
  const filteredOrders = orders.filter((o) => {
    // Tab filter
    const isActive = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(
      o.status
    );
    if (activeTab === 'ACTIVE' && !isActive) return false;
    if (activeTab === 'COMPLETED' && isActive) return false;

    // Status filter
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;

    // Date filter
    if (dateFilter) {
      const orderDateStr = new Date(o.orderDate).toISOString().split('T')[0];
      if (orderDateStr !== dateFilter) return false;
    }

    return true;
  });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {toastMessage && (
        <div className="toast-container">
          <div className="toast success">
            <Icons.CheckCircle size={20} color="var(--success)" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header with AI Quick Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
            My Campus Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Welcome back, <strong>{user?.name}</strong>. Track, manage, review, or refund your meals.
          </p>
        </div>

        <Link to="/customer/insights" className="btn btn-outline-primary">
          <Icons.Sparkles size={16} />
          <span>Ask AI Order Insights</span>
        </Link>
      </div>

      {/* Tabs & Filters Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { key: 'ALL', label: `All Orders (${orders.length})` },
            {
              key: 'ACTIVE',
              label: `Active (${
                orders.filter((o) =>
                  ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(
                    o.status
                  )
                ).length
              })`,
            },
            {
              key: 'COMPLETED',
              label: `Past / Completed (${
                orders.filter((o) => ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status)).length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: activeTab === tab.key ? 'var(--primary)' : '#f1f5f9',
                color: activeTab === tab.key ? '#ffffff' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Status selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Icons.Filter size={15} color="var(--text-muted)" />
            <select
              className="form-control"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PLACED">PLACED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="PREPARING">PREPARING</option>
              <option value="READY">READY</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          {/* Date selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Icons.Calendar size={15} color="var(--text-muted)" />
            <input
              type="date"
              className="form-control"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', width: 'auto' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                style={{ padding: '4px', color: 'var(--text-muted)' }}
                title="Clear date"
              >
                <Icons.X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <Icons.RefreshCw size={36} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem' }}>Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Icons.Clock size={44} color="var(--text-light)" />
          <h3 style={{ marginTop: '1rem', color: 'var(--secondary)' }}>No orders match criteria</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Try resetting your filters or place a new hunger-busting order!
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            const canCancel = order.status === 'PLACED';

            return (
              <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                {/* Order Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--border-light)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--secondary)' }}>
                        Order #{order.id}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {order.restaurantName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Placed on {new Date(order.orderDate).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                      ₹{order.total}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Payment:{' '}
                      <strong style={{ color: order.paymentStatus === 'refunded' ? 'var(--info)' : 'var(--success)' }}>
                        {order.paymentStatus}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Visual Order Lifecycle Tracker */}
                <OrderTracker status={order.status} />

                {/* Items Breakdown */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    margin: '1rem 0',
                    fontSize: '0.88rem',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--secondary)' }}>
                    Items Ordered:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {(order.items || []).map((it, idx) => (
                      <li key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          {it.quantity}x {it.name}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>₹{it.price * it.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📍 <strong>Delivery Address:</strong> {order.deliveryAddress}
                    {order.deliveryPartnerName && (
                      <span style={{ marginLeft: '1rem' }}>
                        🛵 <strong>Delivery Partner:</strong> {order.deliveryPartnerName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Existing Review or Return info if present */}
                {order.review && (
                  <div
                    style={{
                      background: 'var(--warning-bg)',
                      border: '1px solid #fde68a',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#92400e', marginBottom: '2px' }}>
                      <Icons.Star size={15} filled />
                      <span>Your Review: {order.review.rating} / 5 Stars</span>
                    </div>
                    <p style={{ color: '#78350f', margin: 0, fontStyle: 'italic' }}>
                      "{order.review.comment}"
                    </p>
                  </div>
                )}

                {order.returnRequest && (
                  <div
                    style={{
                      background:
                        order.returnRequest.status === 'approved'
                          ? 'var(--info-bg)'
                          : order.returnRequest.status === 'rejected'
                          ? 'var(--danger-bg)'
                          : 'var(--warning-bg)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                      Return/Refund Status: <span style={{ textTransform: 'uppercase' }}>{order.returnRequest.status}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Reason: "{order.returnRequest.reason}"
                    </div>
                  </div>
                )}

                {/* Actions per PRD rules */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Cancel Button: Enabled ONLY in PLACED status */}
                  {canCancel && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingId === order.id}
                    >
                      <Icons.X size={14} />
                      <span>{cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}</span>
                    </button>
                  )}

                  {/* Review & Return Buttons: Enabled for DELIVERED orders */}
                  {isDelivered && !order.review && (
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setReviewOrder(order)}
                    >
                      <Icons.Star size={14} />
                      <span>Write Review & Rating</span>
                    </button>
                  )}

                  {isDelivered && !order.returnRequest && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => setReturnOrder(order)}
                    >
                      <Icons.RefreshCw size={14} />
                      <span>Request Return / Refund</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        order={reviewOrder}
        isOpen={!!reviewOrder}
        onClose={() => setReviewOrder(null)}
        onSubmit={handleReviewSubmit}
      />

      {/* Return Request Modal */}
      <ReturnRequestModal
        order={returnOrder}
        isOpen={!!returnOrder}
        onClose={() => setReturnOrder(null)}
        onSubmit={handleReturnSubmit}
      />
    </div>
  );
};
