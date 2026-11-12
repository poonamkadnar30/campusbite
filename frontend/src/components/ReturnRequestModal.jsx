import React, { useState } from 'react';
import { Icons } from './Icons';

export const ReturnRequestModal = ({ order, isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a specific reason for requesting a return or refund.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(order.id, reason);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Request Return / Refund</h3>
          <button className="modal-close" onClick={onClose}>
            <Icons.X size={20} />
          </button>
        </div>

        <div className="alert alert-warning" style={{ fontSize: '0.82rem' }}>
          <Icons.AlertTriangle size={18} />
          <div>
            <strong>CampusBite Policy:</strong> Return and refund requests for Order #{order.id} (₹{order.total}) will be reviewed directly by the restaurant manager.
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Reason for Return / Refund</label>
            <select
              className="form-control"
              style={{ marginBottom: '0.75rem' }}
              onChange={(e) => {
                if (e.target.value) {
                  setReason(e.target.value);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Select a standard reason (or write custom below)</option>
              <option value="Food delivered was cold and delayed">Food delivered was cold and delayed</option>
              <option value="Incorrect or missing items in the package">Incorrect or missing items in the package</option>
              <option value="Food packaging was damaged or leaked">Food packaging was damaged or leaked</option>
              <option value="Food quality or taste was spoiled/unacceptable">Food quality or taste was spoiled/unacceptable</option>
            </select>

            <textarea
              className="form-control"
              rows="4"
              placeholder="Provide complete details explaining the issue with your meal..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              {submitting ? 'Submitting Request...' : 'Submit Refund Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
