import React from 'react';
import { Icons } from './Icons';

const LIFECYCLE_STEPS = [
  { key: 'PLACED', label: 'Placed' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export const OrderTracker = ({ status }) => {
  const currentStatus = (status || '').toUpperCase();

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="alert alert-danger" style={{ margin: '1rem 0' }}>
        <Icons.AlertTriangle size={20} />
        <div>
          <strong>Order Cancelled</strong>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>This order was cancelled and a refund was credited.</p>
        </div>
      </div>
    );
  }

  if (currentStatus === 'REFUNDED') {
    return (
      <div className="alert alert-info" style={{ margin: '1rem 0' }}>
        <Icons.DollarSign size={20} />
        <div>
          <strong>Order Refunded</strong>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>The return/refund request was approved and processed.</p>
        </div>
      </div>
    );
  }

  const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const progressPercent = (activeIndex / (LIFECYCLE_STEPS.length - 1)) * 100;

  return (
    <div style={{ margin: '1.5rem 0 1rem 0' }}>
      <div className="order-tracker">
        <div className="tracker-line">
          <div
            className="tracker-line-progress"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {LIFECYCLE_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={step.key}
              className={`tracker-step ${isCompleted ? 'completed' : ''} ${
                isCurrent ? 'current' : ''
              }`}
            >
              <div className="tracker-node">
                {isCompleted ? <Icons.Check size={16} /> : idx + 1}
              </div>
              <span className="tracker-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
