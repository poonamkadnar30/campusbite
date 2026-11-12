import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  apiGetMenuItems,
  apiCreateMenuItem,
  apiUpdateMenuItem,
  apiDeleteMenuItem,
} from '../services/api';
import { Icons } from '../components/Icons';

export const MenuManagement = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [feedback, setFeedback] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Curry',
    price: '',
    description: '',
    image: '',
    is_available: true,
  });

  const restaurantId = user?.restaurantId;

  useEffect(() => {
    loadMenu();
  }, [user]);

  const loadMenu = async () => {
    if (!restaurantId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiGetMenuItems(restaurantId);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Curry',
      price: '',
      description: '',
      image: '',
      is_available: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      image: item.image,
      is_available: item.is_available,
    });
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (item) => {
    try {
      await apiUpdateMenuItem(item.id, { is_available: !item.is_available });
      setFeedback(`"${item.name}" marked as ${!item.is_available ? 'Available' : 'Unavailable'}`);
      await loadMenu();
    } catch (err) {
      alert(err.message || 'Failed to update availability');
    }
  };

  const handleDeleteItem = async (item) => {
    const confirm = window.confirm(`Are you sure you want to delete "${item.name}" from your menu?`);
    if (!confirm) return;

    try {
      await apiDeleteMenuItem(item.id);
      setFeedback(`"${item.name}" deleted successfully.`);
      await loadMenu();
    } catch (err) {
      alert(err.message || 'Failed to delete dish');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantId) return;

    try {
      if (editingItem) {
        await apiUpdateMenuItem(editingItem.id, {
          ...formData,
          price: Number(formData.price),
        });
        setFeedback(`Updated "${formData.name}"`);
      } else {
        await apiCreateMenuItem({
          ...formData,
          price: Number(formData.price),
          restaurantId,
        });
        setFeedback(`Added "${formData.name}" to menu!`);
      }
      setIsModalOpen(false);
      await loadMenu();
    } catch (err) {
      alert(err.message || 'Failed to save menu item');
    }
  };

  const filtered = items.filter(
    (it) =>
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.category.toLowerCase().includes(search.toLowerCase())
  );

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
            Restaurant Menu Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Add new recipes, adjust prices, edit descriptions, and toggle item availability
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Icons.Plus size={16} />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: 400 }}>
        <Icons.Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter menu dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.92rem' }}
        />
        {search && (
          <button onClick={() => setSearch('')}>
            <Icons.X size={16} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Dishes Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <Icons.RefreshCw size={36} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem' }}>Loading menu items...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Icons.ChefHat size={40} color="var(--text-light)" />
          <h3 style={{ marginTop: '0.75rem', color: 'var(--secondary)' }}>No dishes found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Add your first dish using the button above.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status (Toggle Availability)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
                          }}
                        />
                        <div>
                          <strong>{item.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge customer">{item.category}</span>
                    </td>
                    <td>
                      <strong>₹{item.price}</strong>
                    </td>
                    <td>
                      {/* Availability toggle switch button */}
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: item.is_available ? '1px solid #a7f3d0' : '1px solid #fecaca',
                          background: item.is_available ? 'var(--success-bg)' : 'var(--danger-bg)',
                          color: item.is_available ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: item.is_available ? 'var(--success)' : 'var(--danger)',
                          }}
                        />
                        <span>{item.is_available ? 'Available' : 'Unavailable'}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit Dish"
                        >
                          <Icons.Edit size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleDeleteItem(item)}
                          title="Delete Dish"
                        >
                          <Icons.Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Dish' : 'Add New Dish to Menu'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <Icons.X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Dish Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Paneer Tikka Masala"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Biryani, Curry, Burgers, Drinks"
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="e.g. 199"
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Detailed description of flavors and ingredients..."
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (Optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formData.is_available}
                  onChange={(e) => setFormData((p) => ({ ...p, is_available: e.target.checked }))}
                />
                <label htmlFor="availCheck" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                  Mark dish as immediately available to order
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
