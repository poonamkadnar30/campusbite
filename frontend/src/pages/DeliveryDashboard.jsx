import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGetOrders, apiUpdateOrderStatus } from '../services/api';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { Icons } from '../components/Icons';

export const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' | 'HISTORY'
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Pagination for history per PRD Section 6
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const partnerId = user?.id || 3;

  useEffect(() => {
    loadDeliveries();
  }, [user]);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const data = await apiGetOrders({ assignedTo: partnerId });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await apiUpdateOrderStatus(orderId, newStatus);
      setFeedback(`Order #${orderId} marked as "${newStatus}"!`);
      await loadDeliveries();
    } catch (err) {
      alert(err.message || 'Failed to update delivery status');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeDeliveries = orders.filter((o) =>
    ['ASSIGNED', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  const historyDeliveries = orders.filter((o) =>
    ['DELIVERED', 'REFUNDED'].includes(o.status)
  );

  // Pagination logic
  const totalPages = Math.ceil(historyDeliveries.length / itemsPerPage) || 1;
  const paginatedHistory = historyDeliveries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* Toast */}
      {feedback && (
        <div className="toast-container">
          <div className="toast success">
            <Icons.CheckCircle size={20} color="var(--success)" />
            <span>{feedback}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
            Delivery Partner Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Rider: <strong>{user?.name}</strong> • Vehicle: DL-01-CB-9021 • Active Campus Zone
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={loadDeliveries}>
          <Icons.RefreshCw size={15} />
          <span>Refresh Deliveries</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Tasks
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.35rem' }}>
            {activeDeliveries.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Orders awaiting pickup or dropoff</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Completed Deliveries
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.35rem' }}>
            {historyDeliveries.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivered across campus</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Delivery Rating
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>4.9</span>
            <Icons.Star size={20} filled />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on student feedback</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('ACTIVE')}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.92rem',
            background: activeTab === 'ACTIVE' ? 'var(--primary)' : '#ffffff',
            color: activeTab === 'ACTIVE' ? '#ffffff' : 'var(--text-main)',
            border: '1px solid var(--border)',
          }}
        >
          🛵 Active Tasks ({activeDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.92rem',
            background: activeTab === 'HISTORY' ? 'var(--primary)' : '#ffffff',
            color: activeTab === 'HISTORY' ? '#ffffff' : 'var(--text-main)',
            border: '1px solid var(--border)',
          }}
        >
          📜 Delivery History ({historyDeliveries.length})
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'ACTIVE' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <Icons.RefreshCw size={36} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '0.75rem' }}>Checking assigned orders...</p>
            </div>
          ) : activeDeliveries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <Icons.Truck size={44} color="var(--text-light)" />
              <h3 style={{ marginTop: '0.75rem', color: 'var(--secondary)' }}>No active deliveries assigned</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                You are on active standby. New orders marked READY by restaurant owners will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activeDeliveries.map((order) => (
                <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Order #{order.id}</span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Restaurant: <strong>{order.restaurantName}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                        ₹{order.total}
                      </div>
                      <span className="role-badge customer">Prepaid (mock_paid)</span>
                    </div>
                  </div>

                  {/* Customer Delivery Details (PRD Section 2C) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '1rem',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      margin: '1rem 0',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Customer Info
                      </div>
                      <div style={{ fontWeight: 700, marginTop: '2px' }}>{order.customerName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--primary)', marginTop: '2px' }}>
                        <Icons.Phone size={13} />
                        <a href={`tel:${order.customerPhone}`} style={{ color: 'inherit' }}>
                          {order.customerPhone}
                        </a>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Drop-off Location
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: '0.88rem', fontWeight: 600, marginTop: '2px' }}>
                        <Icons.MapPin size={15} color="var(--primary)" style={{ marginTop: '2px' }} />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Order Package
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '2px' }}>
                        {(order.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                    {order.status === 'ASSIGNED' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                        disabled={updatingId === order.id}
                      >
                        <Icons.Truck size={16} />
                        <span>Pick Up & Start Delivery (Out for Delivery)</span>
                      </button>
                    )}

                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        className="btn btn-success"
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        disabled={updatingId === order.id}
                      >
                        <Icons.CheckCircle size={16} />
                        <span>Mark Order as Delivered</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab with Pagination */}
      {activeTab === 'HISTORY' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Delivery Address</th>
                  <th>Items Delivered</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>{order.customerName}</td>
                    <td>{order.deliveryAddress}</td>
                    <td>
                      <span style={{ fontSize: '0.82rem' }}>
                        {(order.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </span>
                    </td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (PRD Section 6 requirement) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-light)',
              background: '#f8fafc',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {paginatedHistory.length} of {historyDeliveries.length} completed orders
            </span>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 0.5rem' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
