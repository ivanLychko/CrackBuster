import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import ImageGallery from './ImageGallery';
import RichTextEditor from './RichTextEditor';
import { authenticatedFetch } from '../../utils/auth';
import './AdminCommon.scss';

// Works List Component
const AdminWorksList = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/works');
      const data = await response.json();
      setWorks(data.works || []);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (work) => {
    navigate(`/admin/content/works/edit/${work._id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this work?')) return;
    
    try {
      const response = await authenticatedFetch(`/api/admin/works/${id}`, {
        method: 'DELETE'
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

  const handleNewWork = () => {
    navigate('/admin/content/works/new');
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Manage Works Gallery</h1>
        <button onClick={handleNewWork} className="btn btn-primary">
          + Add New Work
        </button>
      </div>

      <div className="admin-list">
        <h2>All Works</h2>
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

// Work Form Component
const AdminWorkForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [services, setServices] = useState([]);
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
    fetchServices();
    if (isEditing) {
      fetchWork();
    }
  }, [id]);

  const fetchServices = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchWork = async () => {
    try {
      const response = await authenticatedFetch(`/api/admin/works/${id}`);
      const data = await response.json();
      const work = data.work;
      setFormData({
        title: work.title || '',
        description: work.description || '',
        images: work.images || [],
        service: work.service?._id || work.service || '',
        location: work.location || '',
        completedAt: work.completedAt ? new Date(work.completedAt).toISOString().split('T')[0] : '',
        featured: work.featured || false
      });
    } catch (error) {
      console.error('Error fetching work:', error);
      alert('Error loading work');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `/api/admin/works/${id}`
        : '/api/admin/works';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        images: Array.isArray(formData.images) ? formData.images : [],
        completedAt: formData.completedAt || new Date(),
        service: formData.service || null
      };

      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(isEditing ? 'Work updated!' : 'Work created!');
        navigate('/admin/content/works');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to save'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <button onClick={() => navigate('/admin/content/works')} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
          ← Back to Works Gallery
        </button>
        <h1>{isEditing ? 'Edit Work' : 'Create New Work'}</h1>
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
          <RichTextEditor
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            rows={5}
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
            {isEditing ? 'Update Work' : 'Create Work'}
          </button>
          <button type="button" onClick={() => navigate('/admin/content/works')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Main AdminWorks Component with Routing
const AdminWorks = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminWorksList />} />
      <Route path="new" element={<AdminWorkForm />} />
      <Route path="edit/:id" element={<AdminWorkForm />} />
    </Routes>
  );
};

export default AdminWorks;
