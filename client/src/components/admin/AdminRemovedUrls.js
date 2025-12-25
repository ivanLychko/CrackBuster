import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { authenticatedFetch } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import './AdminCommon.scss';

// Removed URLs List Component
const AdminRemovedUrlsList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [removedUrls, setRemovedUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRemovedUrls();
  }, []);

  const fetchRemovedUrls = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/removed-urls');
      const data = await response.json();
      setRemovedUrls(data.removedUrls || []);
    } catch (error) {
      console.error('Error fetching removed URLs:', error);
      showError('Error loading removed URLs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (removedUrl) => {
    navigate(`/admin/removed-urls/edit/${removedUrl._id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this URL from the removed URLs list?')) return;
    
    try {
      const response = await authenticatedFetch(`/api/admin/removed-urls/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchRemovedUrls();
        showSuccess('Removed URL deleted!');
      } else {
        showError('Error deleting removed URL');
      }
    } catch (error) {
      showError('Error: ' + error.message);
    }
  };

  const handleNewRemovedUrl = () => {
    navigate('/admin/removed-urls/new');
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h1>Removed URLs (410 Gone)</h1>
          <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
            Manage URLs that should return 410 Gone status for Google Bot. All URLs in this list will be tracked via middleware and return 410 status.
          </p>
        </div>
        <button onClick={handleNewRemovedUrl} className="btn btn-primary">
          + Add Removed URL
        </button>
      </div>

      <div className="admin-list">
        <h2>All Removed URLs</h2>
        {removedUrls.length === 0 ? (
          <p>No removed URLs found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Reason</th>
                <th>Removed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {removedUrls.map(removedUrl => (
                <tr key={removedUrl._id}>
                  <td>
                    <code style={{ 
                      background: '#f5f5f5', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}>
                      {removedUrl.url}
                    </code>
                  </td>
                  <td>{removedUrl.reason || '-'}</td>
                  <td>
                    {removedUrl.removedAt 
                      ? new Date(removedUrl.removedAt).toLocaleDateString()
                      : new Date(removedUrl.createdAt).toLocaleDateString()
                    }
                  </td>
                  <td>
                    <button onClick={() => handleEdit(removedUrl)} className="btn-small btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(removedUrl._id)} className="btn-small btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Removed URL Form Component
const AdminRemovedUrlForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [formData, setFormData] = useState({
    url: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchRemovedUrl();
    }
  }, [id]);

  const fetchRemovedUrl = async () => {
    try {
      const response = await authenticatedFetch(`/api/admin/removed-urls/${id}`);
      const data = await response.json();
      const removedUrl = data.removedUrl;
      setFormData({
        url: removedUrl.url || '',
        reason: removedUrl.reason || '',
        notes: removedUrl.notes || ''
      });
    } catch (error) {
      console.error('Error fetching removed URL:', error);
      showError('Error loading removed URL');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `/api/admin/removed-urls/${id}`
        : '/api/admin/removed-urls';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSuccess(isEditing ? 'Removed URL updated!' : 'Removed URL added!');
        navigate('/admin/removed-urls');
      } else {
        const error = await response.json();
        showError('Error: ' + (error.error || 'Failed to save'));
      }
    } catch (error) {
      showError('Error: ' + error.message);
    }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <button onClick={() => navigate('/admin/removed-urls')} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
          ← Back to Removed URLs
        </button>
        <h1>{isEditing ? 'Edit Removed URL' : 'Add Removed URL'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>URL Path *</label>
          <input
            type="text"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="/old-page or /old-page/sub-page"
            required
          />
          <p className="form-hint">
            Enter the URL path that should return 410 Gone status. Start with "/" (e.g., /old-page). 
            Sub-paths will also return 410 (e.g., if /old-page is removed, /old-page/sub will also return 410).
          </p>
        </div>

        <div className="form-group">
          <label>Reason</label>
          <input
            type="text"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Page permanently removed, content moved, etc."
          />
          <p className="form-hint">
            Optional: Reason why this URL was removed (for internal reference).
          </p>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows="3"
            placeholder="Additional notes about this removed URL..."
          />
          <p className="form-hint">
            Optional: Additional notes or information about this removed URL.
          </p>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Removed URL' : 'Add Removed URL'}
          </button>
          <button type="button" onClick={() => navigate('/admin/removed-urls')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Main AdminRemovedUrls Component with Routing
const AdminRemovedUrls = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminRemovedUrlsList />} />
      <Route path="new" element={<AdminRemovedUrlForm />} />
      <Route path="edit/:id" element={<AdminRemovedUrlForm />} />
    </Routes>
  );
};

export default AdminRemovedUrls;

