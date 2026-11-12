import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  apiGetRestaurantStats,
  apiGetReminders,
  apiGetOrders,
  apiUpdateOrderStatus,
} from '../services/api';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { Icons } from '../components/Icons';

export const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const restaurantId = user?.restaurantId;

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!restaurantId) {
      setStats(null);
      setReminders([]);
      setRecentOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [statsData, remindersData, ordersData] = await Promise.all([
        apiGetRestaurantStats(restaurantId),
        apiGetReminders(restaurantId),
        apiGetOrders({ restaurantId }),
      ]);
      setStats(statsData);
      setReminders(remindersData);
      setRecentOrders(ordersData.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await apiUpdateOrderStatus(orderId, newStatus);
      await loadDashboard();
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        <Icons.RefreshCw size={36} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '0.75rem' }}>Loading restaurant dashboard...</p>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="card" style={{ maxWidth: 640, margin: '3rem auto', padding: '2rem' }}>
        <h1>Restaurant setup required</h1>
        <p>No restaurant is linked to this owner account. Create a new owner account with a restaurant name or contact an administrator to link an existing account.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
            Restaurant Management Hub
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Operating Portal for <strong>{user?.restaurantName || 'Your Restaurant'}</strong> (Manager: {user?.name})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/owner/menu" className="btn btn-secondary btn-sm">
            <Icons.Plus size={15} />
            <span>Manage Menu</span>
          </Link>
          <Link to="/owner/orders" className="btn btn-primary btn-sm">
            <Icons.CheckCircle size={15} />
            <span>All Orders & Refunds</span>
          </Link>
        </div>
      </div>

      {/* Background Task Reminders (PRD Section 8) */}
      {reminders && reminders.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '1.75rem', borderLeft: '5px solid #f59e0b' }}>
          <Icons.AlertTriangle size={24} color="#b45309" />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.95rem' }}>
              ⚠️ Background Task Alert: {reminders.length} order(s) waiting &gt; 15 minutes!
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
              {reminders.map((rem) => (
                <div key={rem.id} style={{ fontSize: '0.85rem' }}>
                  {rem.message}
                </div>
              ))}
            </div>
          </div>
          <Link to="/owner/orders" className="btn btn-primary btn-sm" style={{ alignSelf: 'center' }}>
            Action Now
          </Link>
        </div>
      )}

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Revenue
            </span>
            <span style={{ padding: '6px', background: 'var(--success-bg)', borderRadius: 'var(--radius-sm)' }}>
              <Icons.DollarSign size={18} color="var(--success)" />
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.5rem' }}>
            ₹{stats?.totalRevenue || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem', fontWeight: 600 }}>
            ● Recorded in dummy payment ledger
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Orders
            </span>
            <span style={{ padding: '6px', background: 'var(--info-bg)', borderRadius: 'var(--radius-sm)' }}>
              <Icons.Clock size={18} color="var(--info)" />
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.5rem' }}>
            {stats?.totalOrders || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across all time
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Orders
            </span>
            <span style={{ padding: '6px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
              <Icons.ChefHat size={18} color="var(--primary)" />
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem' }}>
            {stats?.activeOrdersCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Kitchen & Delivery Pipeline
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pending Returns
            </span>
            <span style={{ padding: '6px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)' }}>
              <Icons.RefreshCw size={18} color="var(--danger)" />
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stats?.pendingReturnsCount > 0 ? 'var(--danger)' : 'var(--secondary)', marginTop: '0.5rem' }}>
            {stats?.pendingReturnsCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Awaiting manager action
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary)' }}>
            Recent Kitchen Orders
          </h3>
          <Link to="/owner/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
            View Full Order Table →
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Kitchen Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.id}</strong>
                  </td>
                  <td>
                    <div>{order.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerPhone}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>
                      {(order.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </span>
                  </td>
                  <td>
                    <strong>₹{order.total}</strong>
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td>
                    {order.status === 'PLACED' && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={updatingId === order.id}
                        onClick={() => handleQuickStatusUpdate(order.id, 'ACCEPTED')}
                      >
                        Accept Order
                      </button>
                    )}
                    {order.status === 'ACCEPTED' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                        disabled={updatingId === order.id}
                        onClick={() => handleQuickStatusUpdate(order.id, 'PREPARING')}
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        className="btn btn-success btn-sm"
                        disabled={updatingId === order.id}
                        onClick={() => handleQuickStatusUpdate(order.id, 'READY')}
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <Link to="/owner/orders" className="btn btn-secondary btn-sm">
                        Assign Driver →
                      </Link>
                    )}
                    {['ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(
                      order.status
                    ) && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        In Delivery / Finalized
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
