import React, { useState, useEffect } from 'react';
import './AdminCommon.scss';

const AdminSettings = () => {
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
    youtube: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      });
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
          youtube: data.settings.youtube || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to save settings'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading settings...</div>;
  }

  return (
    <div className="admin-section">
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




