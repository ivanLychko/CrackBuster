import React, { useState, useEffect } from 'react';
import ImagePicker from './ImagePicker';
import './AdminCommon.scss';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    image: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    featured: false,
    faq: []
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services', {
        credentials: 'include'
      });
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing 
        ? `/api/admin/services/${editing._id}`
        : '/api/admin/services';
      
      const method = editing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        faq: formData.faq || []
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchServices();
        resetForm();
        alert(editing ? 'Service updated!' : 'Service created!');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to save'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (service) => {
    setEditing(service);
    setFormData({
      title: service.title || '',
      slug: service.slug || '',
      description: service.description || '',
      content: service.content || '',
      image: service.image || '',
      metaTitle: service.metaTitle || '',
      metaDescription: service.metaDescription || '',
      keywords: (service.keywords || []).join(', '),
      featured: service.featured || false,
      faq: service.faq || []
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchServices();
        alert('Service deleted!');
      } else {
        alert('Error deleting service');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      image: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      featured: false,
      faq: []
    });
  };

  const addFAQItem = () => {
    setFormData({
      ...formData,
      faq: [...(formData.faq || []), { question: '', answer: '' }]
    });
  };

  const updateFAQItem = (index, field, value) => {
    const updatedFAQ = [...(formData.faq || [])];
    updatedFAQ[index] = { ...updatedFAQ[index], [field]: value };
    setFormData({ ...formData, faq: updatedFAQ });
  };

  const removeFAQItem = (index) => {
    const updatedFAQ = formData.faq.filter((_, i) => i !== index);
    setFormData({ ...formData, faq: updatedFAQ });
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Manage Services</h1>
        <button onClick={resetForm} className="btn btn-primary">
          + Add New Service
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
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
            <label>Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label>Content *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows="10"
            required
          />
        </div>

        <div className="form-group">
          <ImagePicker
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            category="stock"
            label="Service Image"
          />
        </div>

        <div className="form-row">
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

        <div className="form-group">
          <label>Meta Title</label>
          <input
            type="text"
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Meta Description</label>
          <textarea
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            rows="2"
          />
        </div>

        <div className="form-group">
          <label>Keywords (comma separated)</label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="foundation, repair, crack"
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label>FAQ Items</label>
            <button type="button" onClick={addFAQItem} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              + Add FAQ
            </button>
          </div>
          {formData.faq && formData.faq.length > 0 && (
            <div className="faq-items">
              {formData.faq.map((item, index) => (
                <div key={index} className="faq-item" style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong>FAQ #{index + 1}</strong>
                    <button 
                      type="button" 
                      onClick={() => removeFAQItem(index)} 
                      className="btn-small btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.9rem' }}>Question *</label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateFAQItem(index, 'question', e.target.value)}
                      placeholder="Enter question"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem' }}>Answer *</label>
                    <textarea
                      value={item.answer}
                      onChange={(e) => updateFAQItem(index, 'answer', e.target.value)}
                      rows="3"
                      placeholder="Enter answer"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {(!formData.faq || formData.faq.length === 0) && (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No FAQ items. Click "Add FAQ" to add one.</p>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editing ? 'Update Service' : 'Create Service'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        <h2>Existing Services</h2>
        {services.length === 0 ? (
          <p>No services found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service._id}>
                  <td>{service.title}</td>
                  <td>{service.slug}</td>
                  <td>{service.featured ? '✓' : ''}</td>
                  <td>
                    <button onClick={() => handleEdit(service)} className="btn-small btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(service._id)} className="btn-small btn-danger">
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

export default AdminServices;

