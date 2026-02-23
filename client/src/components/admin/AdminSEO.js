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
    reviewsFeedUrl: '',
    googlePlaceId: '',
    writeReviewUrlOverride: '',
    enabled: false,
    displayCount: 5,
    minStars: 1,
    maxStars: 5,
    hideEmptyReviews: false,
    sortBy: 'newest_first'
  });

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
              placeholder="/images/og-image.webp or full URL"
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

      {/* Google Reviews — feed URL (JSON) */}
      <div className="google-reviews-settings">
        <div className="gr-card gr-card-header">
          <div className="gr-header-icon">⭐</div>
          <div className="gr-header-text">
            <h2>Google Reviews</h2>
            <p>Reviews are loaded from your service URL (JSON: place + reviews)</p>
          </div>
        </div>

        <form onSubmit={handleGoogleReviewSubmit} className="admin-form">
          <div className="gr-card gr-card-body">
            <div className="form-group">
              <label className="gr-label">Reviews feed URL (JSON)</label>
              <input
                type="url"
                value={googleReviewSettings.reviewsFeedUrl || ''}
                onChange={(e) => handleGoogleReviewChange('reviewsFeedUrl', e.target.value)}
                placeholder="http://localhost:3002/api/instances/6994a3f8653079945c492e1c"
                className="gr-input gr-input-url"
              />
              <p className="form-hint">
                URL of your service that returns JSON with <code>place</code> and <code>reviews</code> (author_name, rating, text, iso_date, images).
              </p>
            </div>

            <div className="gr-divider" />
            <h3 className="gr-subsection-title">Write a review link</h3>
            <div className="form-group">
              <label className="gr-label">Google Place ID</label>
              <input
                type="text"
                value={googleReviewSettings.googlePlaceId || ''}
                onChange={(e) => handleGoogleReviewChange('googlePlaceId', e.target.value)}
                placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="gr-input gr-input-url"
              />
              <p className="form-hint">
                Your business Place ID in Google (e.g. from <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer">Place ID Finder</a>). The &quot;Write a review&quot; link will be: <code>https://search.google.com/local/writereview?placeid=...</code>
              </p>
            </div>
            <div className="form-group">
              <label className="gr-label">Custom review link (optional)</label>
              <input
                type="url"
                value={googleReviewSettings.writeReviewUrlOverride || ''}
                onChange={(e) => handleGoogleReviewChange('writeReviewUrlOverride', e.target.value)}
                placeholder="Leave empty to use the link generated from Place ID"
                className="gr-input gr-input-url"
              />
              <p className="form-hint">
                If set, this URL will be used instead of the one generated from Place ID.
              </p>
            </div>

            <div className="gr-divider" />
            <h3 className="gr-subsection-title">Display on site</h3>
            <div className="gr-display-options">
              <div className="form-group gr-checkbox-wrap">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={googleReviewSettings.enabled || false}
                    onChange={(e) => handleGoogleReviewChange('enabled', e.target.checked)}
                  />
                  <span>Show reviews on homepage</span>
                </label>
              </div>
              <div className="form-group gr-display-count">
                <label>Reviews per page</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={googleReviewSettings.displayCount || 5}
                  onChange={(e) => handleGoogleReviewChange('displayCount', parseInt(e.target.value) || 5)}
                  className="gr-input gr-input-narrow"
                />
              </div>
            </div>

            <div className="gr-divider" />
            <h3 className="gr-subsection-title">Review filters</h3>
            <div className="gr-filter-row">
              <div className="form-group">
                <label>Minimum rating (stars)</label>
                <select
                  value={String(googleReviewSettings.minStars ?? 1)}
                  onChange={(e) => handleGoogleReviewChange('minStars', parseInt(e.target.value, 10))}
                  className="gr-input gr-input-narrow"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} and above</option>
                  ))}
                </select>
                <p className="form-hint">Only show reviews with at least this rating</p>
              </div>
              <div className="form-group">
                <label>Maximum rating (stars)</label>
                <select
                  value={String(googleReviewSettings.maxStars ?? 5)}
                  onChange={(e) => handleGoogleReviewChange('maxStars', parseInt(e.target.value, 10))}
                  className="gr-input gr-input-narrow"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} and below</option>
                  ))}
                </select>
                <p className="form-hint">Only show reviews with at most this rating (5 = all)</p>
              </div>
            </div>
            <div className="form-group gr-checkbox-wrap">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!googleReviewSettings.hideEmptyReviews}
                  onChange={(e) => handleGoogleReviewChange('hideEmptyReviews', e.target.checked)}
                />
                <span>Hide reviews without text (rating only)</span>
              </label>
            </div>
            <div className="form-group">
              <label>Sort order</label>
              <select
                value={googleReviewSettings.sortBy || 'newest_first'}
                onChange={(e) => handleGoogleReviewChange('sortBy', e.target.value)}
                className="gr-input gr-input-narrow"
              >
                <option value="newest_first">Newest first</option>
                <option value="oldest_first">Oldest first</option>
                <option value="highest_rating">Highest rating first</option>
                <option value="lowest_rating">Lowest rating first</option>
              </select>
            </div>

            {(googleReviewSettings.lastSynced || googleReviewSettings.lastSyncError) && (
              <div className="gr-sync-status">
                {googleReviewSettings.lastSynced && (
                  <span className="gr-status-ok">✓ Last synced: {new Date(googleReviewSettings.lastSynced).toLocaleString()}</span>
                )}
                {googleReviewSettings.lastSyncError && (
                  <div className="gr-status-err">
                    <strong>Sync error:</strong> {googleReviewSettings.lastSyncError}
                  </div>
                )}
              </div>
            )}

            <div className="gr-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save settings'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sync"
                onClick={(e) => { e.preventDefault(); handleSyncReviews(); }}
                disabled={syncing || !(googleReviewSettings.reviewsFeedUrl && googleReviewSettings.reviewsFeedUrl.trim())}
              >
                {syncing ? 'Syncing...' : 'Synchronize reviews'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSEO;



