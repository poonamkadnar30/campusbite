import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  apiGetOrders,
  apiUpdateOrderStatus,
  apiAssignDeliveryPartner,
  apiGetDeliveryPartners,
  apiHandleReturnRequest,
} from '../services/api';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { Icons } from '../components/Icons';

export const OwnerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const restaurantId = user?.restaurantId;

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!restaurantId) {
      setOrders([]);
      setDeliveryPartners([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [ordersData, partnersData] = await Promise.all([
        apiGetOrders({ restaurantId }),
        apiGetDeliveryPartners(),
      ]);
      setOrders(ordersData);
      setDeliveryPartners(partnersData);
      if (partnersData.length > 0) {
        setSelectedPartnerId(partnersData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusTransition = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await apiUpdateOrderStatus(orderId, newStatus);
      setFeedback(`Order #${orderId} moved to "${newStatus}"`);
      await loadData();
    } catch (err) {
      alert(err.message || 'Status transition failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartnerId || !assigningOrder) return;

    setActionLoading(true);
    try {
      await apiAssignDeliveryPartner(assigningOrder.id, selectedPartnerId);
      setFeedback(`Assigned Order #${assigningOrder.id} to delivery partner!`);
      setAssigningOrder(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Assignment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnAction = async (orderId, action) => {
    const confirm = window.confirm(
      `Are you sure you want to ${action.toUpperCase()} the return/refund request for Order #${orderId}?`
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      await apiHandleReturnRequest(orderId, action);
      setFeedback(`Refund request for Order #${orderId} marked as ${action}ed.`);
      await loadData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (dateFilter) {
      const d = new Date(o.orderDate).toISOString().split('T')[0];
      if (d !== dateFilter) return false;
    }
    return true;
  });

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
            Kitchen Orders & Refund Requests
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage lifecycle progression, delivery assignment, and refund disputes
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: `All (${orders.length})` },
            { key: 'PLACED', label: `Incoming (${orders.filter((o) => o.status === 'PLACED').length})` },
            { key: 'PREPARING', label: `In Kitchen (${orders.filter((o) => ['ACCEPTED', 'PREPARING'].includes(o.status)).length})` },
            { key: 'READY', label: `Ready for Driver (${orders.filter((o) => o.status === 'READY').length})` },
            { key: 'RETURNS', label: `Refund Requests (${orders.filter((o) => o.returnRequest?.status === 'pending').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'RETURNS') setStatusFilter('RETURNS');
                else setStatusFilter(tab.key);
              }}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: statusFilter === tab.key ? 'var(--primary)' : '#f1f5f9',
                color: statusFilter === tab.key ? '#ffffff' : 'var(--text-main)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Icons.Calendar size={15} color="var(--text-muted)" />
            <input
              type="date"
              className="form-control"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} style={{ padding: '4px' }}>
                <Icons.X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <Icons.RefreshCw size={36} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem' }}>Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Icons.Clock size={40} color="var(--text-light)" />
          <h3 style={{ marginTop: '0.75rem', color: 'var(--secondary)' }}>No orders found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No orders currently match this status filter.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer Info</th>
                  <th>Ordered Dishes</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Refund Dispute</th>
                  <th>Lifecycle Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.customerPhone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.deliveryAddress}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                        {(order.items || []).map((it, idx) => (
                          <span key={idx}>
                            • <strong>{it.quantity}x</strong> {it.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong>₹{order.total}</strong>
                      <div style={{ fontSize: '0.72rem', color: order.paymentStatus === 'refunded' ? 'var(--info)' : 'var(--success)' }}>
                        {order.paymentStatus}
                      </div>
                    </td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                      {order.deliveryPartnerName && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          🛵 {order.deliveryPartnerName}
                        </div>
                      )}
                    </td>
                    <td>
                      {/* Customer Return Request Box */}
                      {order.returnRequest ? (
                        <div style={{ maxWidth: 220, fontSize: '0.8rem', background: '#fffbeb', border: '1px solid #fde68a', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '2px' }}>
                            Status: {order.returnRequest.status.toUpperCase()}
                          </div>
                          <div style={{ color: '#78350f', fontStyle: 'italic', marginBottom: '6px' }}>
                            "{order.returnRequest.reason}"
                          </div>
                          {order.returnRequest.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                className="btn btn-success btn-sm"
                                style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                                onClick={() => handleReturnAction(order.id, 'approve')}
                                disabled={actionLoading}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                                onClick={() => handleReturnAction(order.id, 'reject')}
                                disabled={actionLoading}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>None</span>
                      )}
                    </td>
                    <td>
                      {/* Lifecycle Transition Buttons according to PRD Section 4 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {order.status === 'PLACED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStatusTransition(order.id, 'ACCEPTED')}
                            disabled={actionLoading}
                          >
                            Accept Order
                          </button>
                        )}

                        {order.status === 'ACCEPTED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                            onClick={() => handleStatusTransition(order.id, 'PREPARING')}
                            disabled={actionLoading}
                          >
                            Start Preparing
                          </button>
                        )}

                        {order.status === 'PREPARING' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusTransition(order.id, 'READY')}
                            disabled={actionLoading}
                          >
                            Mark Ready
                          </button>
                        )}

                        {order.status === 'READY' && (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setAssigningOrder(order)}
                            disabled={actionLoading}
                          >
                            <Icons.Truck size={14} />
                            <span>Assign Partner</span>
                          </button>
                        )}

                        {['ASSIGNED', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Delivery in progress
                          </span>
                        )}

                        {order.status === 'DELIVERED' && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>
                            Delivered Successfully
                          </span>
                        )}

                        {['CANCELLED', 'REFUNDED'].includes(order.status) && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600 }}>
                            Closed / {order.status}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Delivery Partner Modal (PRD Section 4 & 2B) */}
      {assigningOrder && (
        <div className="modal-overlay" onClick={() => setAssigningOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Delivery Partner</h3>
              <button className="modal-close" onClick={() => setAssigningOrder(null)}>
                <Icons.X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Assign an on-campus delivery partner for Order <strong>#{assigningOrder.id}</strong> (Total: ₹{assigningOrder.total}).
            </p>

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">Select Available Campus Rider</label>
                <select
                  className="form-control"
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  required
                >
                  {deliveryPartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      🛵 {p.name} ({p.vehicleNumber || 'Electric Scooter'} • {p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAssigningOrder(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
