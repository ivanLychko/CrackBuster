import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import './AdminCommon.scss';
import './AdminSEO.scss';

const AdminSEO = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [seoData, setSeoData] = useState({});
  const [googleReviewSettings, setGoogleReviewSettings] = useState({
    placeId: '',
    apiKey: '',
    enabled: false,
    displayCount: 5
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

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
    fetchGoogleReviewSettings();
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

  const fetchGoogleReviewSettings = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/google-reviews/settings');
      const data = await response.json();
      if (data.settings) {
        setGoogleReviewSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching Google Review settings:', error);
    }
  };

  const handleGoogleReviewChange = (field, value) => {
    setGoogleReviewSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoogleReviewSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await authenticatedFetch('/api/admin/google-reviews/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleReviewSettings)
      });

      if (response.ok) {
        showSuccess('Google Review settings saved successfully!');
        await fetchGoogleReviewSettings();
      } else {
        const error = await response.json();
        showError('Error: ' + (error.error || 'Failed to save Google Review settings'));
      }
    } catch (error) {
      showError('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleValidatePlaceId = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('handleValidatePlaceId called', { 
      placeId: googleReviewSettings.placeId, 
      apiKey: googleReviewSettings.apiKey ? '***' : '' 
    });
    
    if (!googleReviewSettings.placeId) {
      showError('Please enter a Place ID first');
      return;
    }

    if (!googleReviewSettings.apiKey) {
      showError('API key is required for validation. Please enter your Google Places API key.');
      return;
    }

    setValidating(true);
    setValidationResult(null);
    
    try {
      console.log('Sending validation request...');
      const response = await authenticatedFetch('/api/admin/google-reviews/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: googleReviewSettings.placeId,
          apiKey: googleReviewSettings.apiKey
        })
      });

      console.log('Validation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Validation error response:', errorData);
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Validation result:', data);
      setValidationResult(data);
      
      if (data.valid) {
        showSuccess(data.message || 'Place ID is valid!');
      } else {
        showError(data.message || 'Place ID validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      showError('Error: ' + error.message);
      setValidationResult({ valid: false, message: error.message });
    } finally {
      setValidating(false);
    }
  };

  const handleSyncReviews = async () => {
    setSyncing(true);
    try {
      const response = await authenticatedFetch('/api/admin/google-reviews/sync', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(data.message || 'Reviews synced successfully!');
        await fetchGoogleReviewSettings();
      } else {
        const error = await response.json();
        showError('Error: ' + (error.error || 'Failed to sync reviews'));
      }
    } catch (error) {
      showError('Error: ' + error.message);
    } finally {
      setSyncing(false);
    }
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

      {/* Google Reviews Settings */}
      <div className="google-reviews-settings">
        <div className="admin-section-header">
          <h2>Google Reviews Settings</h2>
          <p>Configure and sync Google Maps reviews to display on your homepage</p>
        </div>

        <form onSubmit={handleGoogleReviewSubmit} className="admin-form">
          <div className="form-section">
            <div className="form-group">
              <label>
                Google Place ID
                <span 
                  className="tooltip-trigger"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  ℹ️
                  {showTooltip && (
                    <div className="tooltip-content">
                      <strong>How to find your Place ID:</strong>
                      <ol>
                        <li>Go to <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a></li>
                        <li>Search for your business</li>
                        <li>Click on your business listing</li>
                        <li>In the address bar, you'll see a URL like: <code>https://www.google.com/maps/place/Your+Business/@lat,lng,zoom/data=...</code></li>
                        <li>Look for <code>!1s</code> followed by a long string - that's your Place ID</li>
                        <li>Alternatively, use <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer">Google's Place ID Finder</a></li>
                      </ol>
                      <p><strong>Example Place ID format:</strong> <code>ChIJN1t_tDeuEmsRUsoyG83frY4</code></p>
                    </div>
                  )}
                </span>
              </label>
              <input
                type="text"
                value={googleReviewSettings.placeId || ''}
                onChange={(e) => handleGoogleReviewChange('placeId', e.target.value)}
                placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
              />
              <p className="form-hint">
                The unique identifier for your business location on Google Maps.
              </p>
            </div>

            <div className="form-group">
              <label>Google API Key (Optional)</label>
              <input
                type="password"
                value={googleReviewSettings.apiKey || ''}
                onChange={(e) => handleGoogleReviewChange('apiKey', e.target.value)}
                placeholder="AIzaSy..."
              />
              <p className="form-hint">
                Optional: Google Places API key for official API access. If not provided, the system will use alternative methods.
                <a href="https://developers.google.com/maps/documentation/places/web-service/get-api-key" target="_blank" rel="noopener noreferrer"> Get API Key</a>
              </p>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={googleReviewSettings.enabled || false}
                  onChange={(e) => handleGoogleReviewChange('enabled', e.target.checked)}
                />
                <span>Enable Google Reviews on homepage</span>
              </label>
              <p className="form-hint">
                When enabled, Google Reviews will be displayed on the homepage.
              </p>
            </div>

            <div className="form-group">
              <label>Number of Reviews to Display</label>
              <input
                type="number"
                min="1"
                max="20"
                value={googleReviewSettings.displayCount || 5}
                onChange={(e) => handleGoogleReviewChange('displayCount', parseInt(e.target.value) || 5)}
              />
              <p className="form-hint">
                Number of reviews to show on the homepage (1-20).
              </p>
            </div>

            {validationResult && (
              <div className="form-group">
                <div 
                  className="form-hint" 
                  style={{ 
                    color: validationResult.valid ? '#28a745' : '#dc3545',
                    padding: '1rem',
                    backgroundColor: validationResult.valid ? '#f0f9f4' : '#fff5f5',
                    borderRadius: '6px',
                    border: `1px solid ${validationResult.valid ? '#28a745' : '#dc3545'}`
                  }}
                >
                  <strong>{validationResult.valid ? '✓ Valid' : '✗ Invalid'}:</strong><br />
                  {validationResult.message}
                  {validationResult.place && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      <p><strong>Place:</strong> {validationResult.place.name}</p>
                      <p><strong>Address:</strong> {validationResult.place.address}</p>
                      <p><strong>Rating:</strong> {validationResult.place.rating} ⭐ ({validationResult.place.totalRatings} ratings)</p>
                      <p><strong>Reviews available:</strong> {validationResult.place.reviewCount}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {googleReviewSettings.lastSynced && (
              <div className="form-group">
                <p className="form-hint" style={{ color: '#28a745' }}>
                  Last synced: {new Date(googleReviewSettings.lastSynced).toLocaleString()}
                </p>
              </div>
            )}

            {googleReviewSettings.lastSyncError && (
              <div className="form-group">
                <div className="form-hint" style={{ color: '#dc3545', whiteSpace: 'pre-line' }}>
                  <strong>Last sync error:</strong><br />
                  {googleReviewSettings.lastSyncError}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Google Review Settings'}
              </button>
            </div>
          </div>
        </form>

        {/* Action buttons outside form to avoid form submission issues */}
        <div className="form-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Validate button clicked');
              console.log('Current settings:', { 
                placeId: googleReviewSettings.placeId, 
                hasApiKey: !!googleReviewSettings.apiKey 
              });
              handleValidatePlaceId(e);
            }}
            disabled={validating || !googleReviewSettings.placeId || !googleReviewSettings.apiKey}
            style={{ marginRight: '1rem' }}
            title={(!googleReviewSettings.placeId || !googleReviewSettings.apiKey) ? 'Please enter Place ID and API Key first' : 'Validate your Google Place ID'}
          >
            {validating ? 'Validating...' : 'Validate Place ID'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSyncReviews();
            }}
            disabled={syncing || !googleReviewSettings.placeId}
          >
            {syncing ? 'Syncing...' : 'Synchronize Reviews'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSEO;



