import React, { useState, useEffect } from 'react';
import ImageGallery from './ImageGallery';
import './AdminCommon.scss';

const AdminWorks = () => {
  const [works, setWorks] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    service: '',
    location: '',
    completedAt: '',
    featured: false
  });

  useEffect(() => {
    fetchWorks();
    fetchServices();
  }, []);

  const fetchWorks = async () => {
    try {
      const response = await fetch('/api/admin/works', {
        credentials: 'include'
      });
      const data = await response.json();
      setWorks(data.works || []);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services', {
        credentials: 'include'
      });
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing 
        ? `/api/admin/works/${editing._id}`
        : '/api/admin/works';
      
      const method = editing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        images: Array.isArray(formData.images) ? formData.images : [],
        completedAt: formData.completedAt || new Date(),
        service: formData.service || null
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchWorks();
        resetForm();
        alert(editing ? 'Work updated!' : 'Work created!');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to save'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (work) => {
    setEditing(work);
    setFormData({
      title: work.title || '',
      description: work.description || '',
      images: work.images || [],
      service: work.service?._id || work.service || '',
      location: work.location || '',
      completedAt: work.completedAt ? new Date(work.completedAt).toISOString().split('T')[0] : '',
      featured: work.featured || false
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this work?')) return;
    
    try {
      const response = await fetch(`/api/admin/works/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchWorks();
        alert('Work deleted!');
      } else {
        alert('Error deleting work');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      title: '',
      description: '',
      images: [],
      service: '',
      location: '',
      completedAt: '',
      featured: false
    });
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Manage Works Gallery</h1>
        <button onClick={resetForm} className="btn btn-primary">
          + Add New Work
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="5"
            required
          />
        </div>

        <div className="form-group">
          <ImageGallery
            value={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            category="jobs"
            label="Gallery Images"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Service</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            >
              <option value="">None</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Edmonton, AB"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Completed Date</label>
            <input
              type="date"
              value={formData.completedAt}
              onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              Featured
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editing ? 'Update Work' : 'Create Work'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        <h2>Existing Works</h2>
        {works.length === 0 ? (
          <p>No works found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Images</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {works.map(work => (
                <tr key={work._id}>
                  <td>{work.title}</td>
                  <td>{work.location || '-'}</td>
                  <td>{(work.images || []).length} images</td>
                  <td>{work.featured ? '✓' : ''}</td>
                  <td>
                    <button onClick={() => handleEdit(work)} className="btn-small btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(work._id)} className="btn-small btn-danger">
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

export default AdminWorks;

