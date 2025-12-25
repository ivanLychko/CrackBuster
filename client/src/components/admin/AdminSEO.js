import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import './AdminCommon.scss';
import './AdminSEO.scss';

const AdminSEO = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [seoData, setSeoData] = useState({});

  const pages = [
    { value: 'home', label: 'Home Page' },
    { value: 'about-us', label: 'About Us' },
    { value: 'contact-us', label: 'Contact Us' },
    { value: 'get-estimate', label: 'Get Estimate' },
    { value: 'our-works', label: 'Our Works' },
    { value: 'blog', label: 'Blog Listing' },
    { value: 'blog-post', label: 'Blog Post (Template)' },
    { value: 'service-detail', label: 'Service Detail (Template)' },
    { value: 'services', label: 'Services Listing' },
    { value: '404', label: '404 Page' }
  ];

  useEffect(() => {
    fetchAllSEO();
  }, []);

  useEffect(() => {
    if (seoData[activePage]) {
      // Data already loaded
      return;
    }
    fetchSEO(activePage);
  }, [activePage]);

  const fetchAllSEO = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/seo');
      const data = await response.json();
      if (data.seo) {
        const seoMap = {};
        data.seo.forEach(item => {
          seoMap[item.page] = item;
        });
        setSeoData(seoMap);
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      showError('Error loading SEO data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSEO = async (page) => {
    try {
      const response = await authenticatedFetch(`/api/admin/seo/${page}`);
      const data = await response.json();
      if (data.seo) {
        setSeoData(prev => ({
          ...prev,
          [page]: data.seo
        }));
      }
    } catch (error) {
      console.error('Error fetching SEO:', error);
    }
  };

  const handleChange = (field, value) => {
    setSeoData(prev => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const currentData = seoData[activePage] || {};
      const response = await authenticatedFetch(`/api/admin/seo/${activePage}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });

      if (response.ok) {
        showSuccess('SEO settings saved successfully!');
        // Refresh data
        await fetchSEO(activePage);
      } else {
        const error = await response.json();
        showError('Error: ' + (error.error || 'Failed to save SEO settings'));
      }
    } catch (error) {
      showError('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading SEO settings...</div>;
  }

  const currentData = seoData[activePage] || {
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonicalUrl: '',
    robots: ''
  };

  return (
    <div className="admin-section admin-seo">
      <div className="admin-section-header">
        <h1>SEO Settings</h1>
        <p>Manage SEO meta tags, Open Graph, and Twitter Card data for all pages</p>
      </div>

      <div className="seo-page-selector">
        <label>Select Page:</label>
        <select
          value={activePage}
          onChange={(e) => setActivePage(e.target.value)}
          className="page-select"
        >
          {pages.map(page => (
            <option key={page.value} value={page.value}>
              {page.label}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-section">
          <h2>Basic SEO</h2>

          <div className="form-group">
            <label>Page Title</label>
            <input
              type="text"
              value={currentData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Foundation Crack Repair in Edmonton | CrackBuster"
            />
            <p className="form-hint">
              The title tag that appears in browser tabs and search results. Keep it under 60 characters.
            </p>
          </div>

          <div className="form-group">
            <label>Meta Description</label>
            <textarea
              value={currentData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
              placeholder="Professional foundation crack repair services in Edmonton, Canada..."
            />
            <p className="form-hint">
              The description that appears in search results. Keep it between 150-160 characters for best results.
            </p>
          </div>

          <div className="form-group">
            <label>Keywords (comma separated)</label>
            <input
              type="text"
              value={currentData.keywords || ''}
              onChange={(e) => handleChange('keywords', e.target.value)}
              placeholder="foundation crack repair, edmonton, canada, basement waterproofing"
            />
            <p className="form-hint">
              Comma-separated keywords relevant to this page. Not as important as before, but still useful.
            </p>
          </div>
        </div>

        <div className="form-section">
          <h2>Open Graph (Facebook, LinkedIn)</h2>

          <div className="form-group">
            <label>OG Title</label>
            <input
              type="text"
              value={currentData.ogTitle || ''}
              onChange={(e) => handleChange('ogTitle', e.target.value)}
              placeholder="Leave empty to use page title"
            />
            <p className="form-hint">
              Title for social media sharing. If empty, page title will be used.
            </p>
          </div>

          <div className="form-group">
            <label>OG Description</label>
            <textarea
              value={currentData.ogDescription || ''}
              onChange={(e) => handleChange('ogDescription', e.target.value)}
              rows="3"
              placeholder="Leave empty to use meta description"
            />
            <p className="form-hint">
              Description for social media sharing. If empty, meta description will be used.
            </p>
          </div>

          <div className="form-group">
            <label>OG Image URL</label>
            <input
              type="text"
              value={currentData.ogImage || ''}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              placeholder="/images/og-image.jpg or full URL"
            />
            <p className="form-hint">
              Image URL for social media sharing (1200x630px recommended). Can be relative path or full URL.
            </p>
          </div>
        </div>

        <div className="form-section">
          <h2>Twitter Card</h2>

          <div className="form-group">
            <label>Twitter Title</label>
            <input
              type="text"
              value={currentData.twitterTitle || ''}
              onChange={(e) => handleChange('twitterTitle', e.target.value)}
              placeholder="Leave empty to use OG title or page title"
            />
            <p className="form-hint">
              Title for Twitter sharing. If empty, OG title or page title will be used.
            </p>
          </div>

          <div className="form-group">
            <label>Twitter Description</label>
            <textarea
              value={currentData.twitterDescription || ''}
              onChange={(e) => handleChange('twitterDescription', e.target.value)}
              rows="3"
              placeholder="Leave empty to use OG description or meta description"
            />
            <p className="form-hint">
              Description for Twitter sharing. If empty, OG description or meta description will be used.
            </p>
          </div>

          <div className="form-group">
            <label>Twitter Image URL</label>
            <input
              type="text"
              value={currentData.twitterImage || ''}
              onChange={(e) => handleChange('twitterImage', e.target.value)}
              placeholder="Leave empty to use OG image"
            />
            <p className="form-hint">
              Image URL for Twitter sharing. If empty, OG image will be used.
            </p>
          </div>
        </div>

        <div className="form-section">
          <h2>Advanced</h2>

          <div className="form-group">
            <label>Canonical URL</label>
            <input
              type="text"
              value={currentData.canonicalUrl || ''}
              onChange={(e) => handleChange('canonicalUrl', e.target.value)}
              placeholder="Leave empty for auto-generated URL"
            />
            <p className="form-hint">
              Canonical URL for this page. Usually auto-generated, but you can override if needed.
            </p>
          </div>

          <div className="form-group">
            <label>Robots Meta Tag</label>
            <input
              type="text"
              value={currentData.robots || ''}
              onChange={(e) => handleChange('robots', e.target.value)}
              placeholder="Leave empty to use global setting (index, follow)"
            />
            <p className="form-hint">
              Override robots meta tag for this page (e.g., "noindex, nofollow"). Leave empty to use global setting.
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save SEO Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSEO;



