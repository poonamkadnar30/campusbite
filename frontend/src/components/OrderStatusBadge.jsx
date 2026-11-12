import React from 'react';
import { Icons } from './Icons';

export const OrderStatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  const getDetails = () => {
    switch (normalized) {
      case 'PLACED':
        return { label: 'Order Placed', className: 'status-placed', icon: Icons.Clock };
      case 'ACCEPTED':
        return { label: 'Accepted', className: 'status-accepted', icon: Icons.Check };
      case 'PREPARING':
        return { label: 'Preparing Food', className: 'status-preparing', icon: Icons.ChefHat };
      case 'READY':
        return { label: 'Ready for Pickup', className: 'status-ready', icon: Icons.CheckCircle };
      case 'ASSIGNED':
        return { label: 'Driver Assigned', className: 'status-assigned', icon: Icons.Truck };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Out for Delivery', className: 'status-out_for_delivery', icon: Icons.Truck };
      case 'DELIVERED':
        return { label: 'Delivered', className: 'status-delivered', icon: Icons.CheckCircle };
      case 'CANCELLED':
        return { label: 'Cancelled', className: 'status-cancelled', icon: Icons.X };
      case 'REFUNDED':
        return { label: 'Refunded', className: 'status-refunded', icon: Icons.DollarSign };
      default:
        return { label: normalized, className: 'status-placed', icon: Icons.Clock };
    }
  };

  const { label, className, icon: IconComponent } = getDetails();

  return (
    <span className={`status-badge ${className}`}>
      <IconComponent size={14} />
      <span>{label}</span>
    </span>
  );
};
