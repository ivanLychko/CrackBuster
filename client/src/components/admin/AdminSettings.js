import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import './AdminCommon.scss';
import './AdminSettings.scss';

const AdminSettings = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    address: '',
    serviceArea: '',
    secondaryPhone: '',
    secondaryEmail: '',
    businessHours: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    allowIndexing: true,
    notificationsEnabled: true,
    notificationEmail: '',
    estimateNotificationsEnabled: true,
    contactNotificationsEnabled: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/settings');
      const data = await response.json();
      if (data.settings) {
        setFormData({
          phone: data.settings.phone || '',
          email: data.settings.email || '',
          address: data.settings.address || '',
          serviceArea: data.settings.serviceArea || '',
          secondaryPhone: data.settings.secondaryPhone || '',
          secondaryEmail: data.settings.secondaryEmail || '',
          businessHours: data.settings.businessHours || '',
          facebook: data.settings.facebook || '',
          instagram: data.settings.instagram || '',
          twitter: data.settings.twitter || '',
          linkedin: data.settings.linkedin || '',
          youtube: data.settings.youtube || '',
          allowIndexing: data.settings.allowIndexing !== undefined ? data.settings.allowIndexing : true,
          notificationsEnabled: data.settings.notificationsEnabled !== undefined ? data.settings.notificationsEnabled : true,
          notificationEmail: data.settings.notificationEmail || '',
          estimateNotificationsEnabled: data.settings.estimateNotificationsEnabled !== undefined ? data.settings.estimateNotificationsEnabled : true,
          contactNotificationsEnabled: data.settings.contactNotificationsEnabled !== undefined ? data.settings.contactNotificationsEnabled : true
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showError('Error loading settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await authenticatedFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSuccess('Settings saved successfully!');
      } else {
        const error = await response.json();
        showError('Error: ' + (error.error || 'Failed to save settings'));
      }
    } catch (error) {
      showError('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading settings...</div>;
  }

  return (
    <div className="admin-section admin-settings">
      <div className="admin-section-header">
        <h1>Site Settings</h1>
        <p>Manage contact information and social media links displayed across the site</p>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-section">
          <h2>Contact Information</h2>

          <div className="form-group">
            <label>Primary Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(780) XXX-XXXX"
              required
            />
          </div>

          <div className="form-group">
            <label>Secondary Phone</label>
            <input
              type="tel"
              name="secondaryPhone"
              value={formData.secondaryPhone}
              onChange={handleChange}
              placeholder="(780) XXX-XXXX"
            />
          </div>

          <div className="form-group">
            <label>Primary Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="info@crackbuster.ca"
              required
            />
          </div>

          <div className="form-group">
            <label>Secondary Email</label>
            <input
              type="email"
              name="secondaryEmail"
              value={formData.secondaryEmail}
              onChange={handleChange}
              placeholder="support@crackbuster.ca"
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Edmonton, Alberta, Canada"
              required
            />
          </div>

          <div className="form-group">
            <label>Service Area</label>
            <input
              type="text"
              name="serviceArea"
              value={formData.serviceArea}
              onChange={handleChange}
              placeholder="Edmonton and surrounding areas"
            />
          </div>

          <div className="form-group">
            <label>Business Hours</label>
            <input
              type="text"
              name="businessHours"
              value={formData.businessHours}
              onChange={handleChange}
              placeholder="Monday - Friday: 8:00 AM - 6:00 PM"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Social Media Links</h2>

          <div className="form-group">
            <label>Facebook URL</label>
            <input
              type="url"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/crackbuster"
            />
          </div>

          <div className="form-group">
            <label>Instagram URL</label>
            <input
              type="url"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/crackbuster"
            />
          </div>

          <div className="form-group">
            <label>Twitter URL</label>
            <input
              type="url"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/crackbuster"
            />
          </div>

          <div className="form-group">
            <label>LinkedIn URL</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/company/crackbuster"
            />
          </div>

          <div className="form-group">
            <label>YouTube URL</label>
            <input
              type="url"
              name="youtube"
              value={formData.youtube}
              onChange={handleChange}
              placeholder="https://youtube.com/@crackbuster"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Email Notifications</h2>
          <p className="form-hint" style={{ marginBottom: '20px' }}>
            Configure email notifications for form submissions. Make sure Mailgun is configured in your environment variables.
          </p>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="notificationsEnabled"
                checked={formData.notificationsEnabled}
                onChange={handleChange}
              />
              <span>Enable email notifications</span>
            </label>
            <p className="form-hint">
              When enabled, you will receive email notifications for form submissions. When disabled, no emails will be sent.
            </p>
          </div>

          <div className="form-group">
            <label>Notification Email Address *</label>
            <input
              type="email"
              name="notificationEmail"
              value={formData.notificationEmail}
              onChange={handleChange}
              placeholder="notifications@your-domain.com"
              required={formData.notificationsEnabled}
              disabled={!formData.notificationsEnabled}
            />
            <p className="form-hint">
              Email address where form submission notifications will be sent. If empty, will use MAILGUN_TO_EMAIL from environment variables.
            </p>
          </div>

          <div className="form-group" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e9ecef' }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="estimateNotificationsEnabled"
                checked={formData.estimateNotificationsEnabled}
                onChange={handleChange}
                disabled={!formData.notificationsEnabled}
              />
              <span>Enable estimate request notifications</span>
            </label>
            <p className="form-hint">
              Receive email notifications when customers submit estimate requests through the "Get Estimate" form.
            </p>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="contactNotificationsEnabled"
                checked={formData.contactNotificationsEnabled}
                onChange={handleChange}
                disabled={!formData.notificationsEnabled}
              />
              <span>Enable contact form notifications</span>
            </label>
            <p className="form-hint">
              Receive email notifications when customers submit messages through the "Contact Us" form.
            </p>
          </div>
        </div>

        <div className="form-section">
          <h2>SEO Settings</h2>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="allowIndexing"
                checked={formData.allowIndexing}
                onChange={handleChange}
              />
              <span>Allow search engine indexing</span>
            </label>
            <p className="form-hint">
              When enabled, search engines (Google, Bing, etc.) can index your website.
              When disabled, search engines will be instructed not to index your site.
            </p>
            <p className="form-hint" style={{ marginTop: '0.5rem', color: '#666', fontStyle: 'italic' }}>
              Note: For detailed SEO settings (meta tags, Open Graph, Twitter Cards), please use the <strong>SEO</strong> section in the admin panel.
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;




