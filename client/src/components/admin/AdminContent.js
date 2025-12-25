import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminServices from './AdminServices';
import AdminBlog from './AdminBlog';
import AdminWorks from './AdminWorks';
import './AdminContent.scss';

const AdminContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes('/content/services')) return 'services';
    if (location.pathname.includes('/content/blog')) return 'blog';
    if (location.pathname.includes('/content/works')) return 'works';
    return 'services'; // default
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
    // Redirect to services if on base content path
    if (location.pathname === '/admin/content' || location.pathname === '/admin/content/') {
      navigate('/admin/content/services', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/content/${tab}`);
  };

  return (
    <div className="admin-content-wrapper">
      <div className="admin-content-header">
        <h1>Content</h1>
      </div>
      
      <div className="admin-content-tabs">
        <button
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => handleTabChange('services')}
        >
          Services
        </button>
        <button
          className={`tab-button ${activeTab === 'blog' ? 'active' : ''}`}
          onClick={() => handleTabChange('blog')}
        >
          Blog Posts
        </button>
        <button
          className={`tab-button ${activeTab === 'works' ? 'active' : ''}`}
          onClick={() => handleTabChange('works')}
        >
          Works Gallery
        </button>
      </div>

      <div className="admin-content-tab-content">
        <Routes>
          <Route path="services/*" element={<AdminServices />} />
          <Route path="blog/*" element={<AdminBlog />} />
          <Route path="works/*" element={<AdminWorks />} />
          <Route path="/" element={<AdminServices />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminContent;

