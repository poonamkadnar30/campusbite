import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGetRestaurantById, apiUpdateRestaurant } from '../services/api';
import { Icons } from '../components/Icons';

/** Lets a restaurant owner manage public profile details. */
export const ManagerProfile = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId;
  const [profile, setProfile] = useState({ cuisine: '', image: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    /** Loads the saved public profile for the linked restaurant. */
    const loadProfile = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }

      try {
        const restaurant = await apiGetRestaurantById(restaurantId);
        setProfile({
          cuisine: restaurant.cuisine || '',
          image: restaurant.image || '',
          description: restaurant.description || '',
        });
      } catch (error) {
        setFeedback(error.message || 'Could not load restaurant profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [restaurantId]);

  /** Persists the public profile fields for the signed-in owner's restaurant. */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      const updated = await apiUpdateRestaurant(restaurantId, {
        cuisine: profile.cuisine.trim(),
        image: profile.image.trim() || null,
        description: profile.description.trim() || null,
      });
      setProfile({
        cuisine: updated.cuisine || '',
        image: updated.image || '',
        description: updated.description || '',
      });
      setFeedback('Profile saved.');
    } catch (error) {
      setFeedback(error.message || 'Could not save restaurant profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        <Icons.RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading manager profile...</p>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="card" style={{ maxWidth: 640, margin: '3rem auto', padding: '2rem' }}>
        <h1>Restaurant setup required</h1>
        <p>No restaurant is linked to this owner account. Contact an administrator to link one.</p>
      </div>
    );
  }

  return (
    <section className="card" style={{ maxWidth: 760, margin: '2rem auto', padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
        Manage Profile
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Update how {user?.restaurantName || 'your restaurant'} appears to customers.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="profileCuisine">Cuisine</label>
          <input
            id="profileCuisine"
            type="text"
            className="form-control"
            maxLength={120}
            value={profile.cuisine}
            onChange={(event) => setProfile((current) => ({ ...current, cuisine: event.target.value }))}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="profileImage">Restaurant Image URL</label>
          <input
            id="profileImage"
            type="url"
            className="form-control"
            maxLength={500}
            value={profile.image}
            onChange={(event) => setProfile((current) => ({ ...current, image: event.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="profileDescription">Description</label>
          <textarea
            id="profileDescription"
            className="form-control"
            rows={4}
            maxLength={500}
            value={profile.description}
            onChange={(event) => setProfile((current) => ({ ...current, description: event.target.value }))}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {feedback && <span role="status" style={{ color: 'var(--text-muted)' }}>{feedback}</span>}
          {profile.image && (
            <img
              src={profile.image}
              alt={`${user?.restaurantName || 'Restaurant'} preview`}
              style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
            />
          )}
        </div>
      </form>
    </section>
  );
};