import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import ImagePicker from './ImagePicker';
import RichTextEditor from './RichTextEditor';
import { authenticatedFetch } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import './AdminCommon.scss';

// Services List Component
const AdminServicesList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    navigate(`/admin/content/services/edit/${service._id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const response = await authenticatedFetch(`/api/admin/services/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchServices();
        showSuccess('Service deleted!');
      } else {
        showError('Error deleting service');
      }
    } catch (error) {
      showError('Error: ' + error.message);
    }
  };

  const handleNewService = () => {
    navigate('/admin/content/services/new');
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Manage Services</h1>
        <button onClick={handleNewService} className="btn btn-primary">
          + Add New Service
        </button>
      </div>

      <div className="admin-list">
        <h2>All Services</h2>
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

// Service Form Component
const AdminServiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
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
    faq: [],
    // Extended SEO fields
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonicalUrl: '',
    robots: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await authenticatedFetch(`/api/admin/services/${id}`);
      const data = await response.json();
      const service = data.service;
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
        faq: service.faq || [],
        // Extended SEO fields
        seoTitle: service.seoTitle || '',
        seoDescription: service.seoDescription || '',
        seoKeywords: service.seoKeywords || '',
        ogTitle: service.ogTitle || '',
        ogDescription: service.ogDescription || '',
        ogImage: service.ogImage || '',
        twitterTitle: service.twitterTitle || '',
        twitterDescription: service.twitterDescription || '',
        twitterImage: service.twitterImage || '',
        canonicalUrl: service.canonicalUrl || '',
        robots: service.robots || ''
      });
    } catch (error) {
      console.error('Error fetching service:', error);
      showError('Error loading service');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `/api/admin/services/${id}`
        : '/api/admin/services';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        faq: formData.faq || []
      };

      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showSuccess(isEditing ? 'Service updated!' : 'Service created!');
        // Don't navigate away - stay on the edit page
        // User can use the "Back to Services" button if they want to leave
      } else {
        const error = await response.json();
        showError('Error: ' + (error.error || 'Failed to save'));
      }
    } catch (error) {
      showError('Error: ' + error.message);
    }
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
        <button onClick={() => navigate('/admin/content/services')} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
          ← Back to Services
        </button>
        <h1>{isEditing ? 'Edit Service' : 'Create New Service'}</h1>
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
          <RichTextEditor
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label>Content *</label>
          <RichTextEditor
            value={formData.content}
            onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
            rows={10}
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
          <RichTextEditor
            value={formData.metaDescription}
            onChange={(value) => setFormData(prev => ({ ...prev, metaDescription: value }))}
            rows={2}
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

        <div className="form-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e0e0e0' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#031167' }}>Extended SEO Settings</h3>
          <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
            These fields override the basic meta tags above. Leave empty to use basic meta tags or template SEO.
          </p>

          <div className="form-group">
            <label>SEO Title</label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              placeholder="Leave empty to use Meta Title or template"
            />
            <p className="form-hint">Page title for search engines. If empty, Meta Title will be used.</p>
          </div>

          <div className="form-group">
            <label>SEO Description</label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              rows="3"
              placeholder="Leave empty to use Meta Description or template"
            />
            <p className="form-hint">Meta description for search engines. If empty, Meta Description will be used.</p>
          </div>

          <div className="form-group">
            <label>SEO Keywords</label>
            <input
              type="text"
              value={formData.seoKeywords}
              onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
              placeholder="Leave empty to use Keywords above or template"
            />
            <p className="form-hint">Comma-separated keywords. If empty, Keywords above will be used.</p>
          </div>

          <div className="form-group">
            <label>Open Graph Title</label>
            <input
              type="text"
              value={formData.ogTitle}
              onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
              placeholder="Leave empty to use SEO Title or template"
            />
            <p className="form-hint">Title for social media sharing (Facebook, LinkedIn).</p>
          </div>

          <div className="form-group">
            <label>Open Graph Description</label>
            <textarea
              value={formData.ogDescription}
              onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
              rows="3"
              placeholder="Leave empty to use SEO Description or template"
            />
            <p className="form-hint">Description for social media sharing.</p>
          </div>

          <div className="form-group">
            <label>Open Graph Image URL</label>
            <input
              type="text"
              value={formData.ogImage}
              onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
              placeholder="/images/og-image.webp or full URL"
            />
            <p className="form-hint">Image URL for social media sharing (1200x630px recommended).</p>
          </div>

          <div className="form-group">
            <label>Twitter Title</label>
            <input
              type="text"
              value={formData.twitterTitle}
              onChange={(e) => setFormData({ ...formData, twitterTitle: e.target.value })}
              placeholder="Leave empty to use OG Title or template"
            />
            <p className="form-hint">Title for Twitter sharing.</p>
          </div>

          <div className="form-group">
            <label>Twitter Description</label>
            <textarea
              value={formData.twitterDescription}
              onChange={(e) => setFormData({ ...formData, twitterDescription: e.target.value })}
              rows="3"
              placeholder="Leave empty to use OG Description or template"
            />
            <p className="form-hint">Description for Twitter sharing.</p>
          </div>

          <div className="form-group">
            <label>Twitter Image URL</label>
            <input
              type="text"
              value={formData.twitterImage}
              onChange={(e) => setFormData({ ...formData, twitterImage: e.target.value })}
              placeholder="Leave empty to use OG Image"
            />
            <p className="form-hint">Image URL for Twitter sharing.</p>
          </div>

          <div className="form-group">
            <label>Canonical URL</label>
            <input
              type="text"
              value={formData.canonicalUrl}
              onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
              placeholder="Leave empty for auto-generated URL"
            />
            <p className="form-hint">Canonical URL for this page. Usually auto-generated.</p>
          </div>

          <div className="form-group">
            <label>Robots Meta Tag</label>
            <input
              type="text"
              value={formData.robots}
              onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
              placeholder="Leave empty to use global setting"
            />
            <p className="form-hint">Override robots meta tag (e.g., "noindex, nofollow"). Leave empty for default.</p>
          </div>
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
            {isEditing ? 'Update Service' : 'Create Service'}
          </button>
          <button type="button" onClick={() => navigate('/admin/content/services')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Main AdminServices Component with Routing
const AdminServices = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminServicesList />} />
      <Route path="new" element={<AdminServiceForm />} />
      <Route path="edit/:id" element={<AdminServiceForm />} />
    </Routes>
  );
};

export default AdminServices;

