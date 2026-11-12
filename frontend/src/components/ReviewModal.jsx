import React, { useState } from 'react';
import { Icons } from './Icons';

export const ReviewModal = ({ order, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback comments for your order.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(order.id, { rating, comment });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Rate & Review Order #{order.id}</h3>
          <button className="modal-close" onClick={onClose}>
            <Icons.X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Delivered from <strong>{order.restaurantName}</strong>. How was your meal?
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Your Rating</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{ background: 'none', border: 'none', padding: '4px' }}
                >
                  <Icons.Star
                    size={32}
                    filled={star <= (hoverRating || rating)}
                  />
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {rating === 5 && '🌟 Exceptional! Loved everything.'}
              {rating === 4 && '😊 Very Good! Tasty & on time.'}
              {rating === 3 && '😐 Average. Food was okay.'}
              {rating === 2 && '😕 Below expectations.'}
              {rating === 1 && '😞 Poor experience.'}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Review Comments</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Tell others what you enjoyed about the food quality, taste, and packaging..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
