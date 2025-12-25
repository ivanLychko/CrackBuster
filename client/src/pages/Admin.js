import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import AdminContent from '../components/admin/AdminContent';
import AdminImages from '../components/admin/AdminImages';
import AdminRequests from '../components/admin/AdminRequests';
import AdminSettings from '../components/admin/AdminSettings';
import AdminSEO from '../components/admin/AdminSEO';
import LoginForm from '../components/admin/LoginForm';
import { isAuthenticated, clearAuthCredentials, authenticatedFetch } from '../utils/auth';
import './Admin.scss';

const Admin = () => {
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (isAuthenticated()) {
      // Verify credentials are still valid
      try {
        const response = await authenticatedFetch('/api/admin/services');
        if (response.ok || response.status === 404) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        setAuthenticated(false);
      }
    } else {
      setAuthenticated(false);
    }
    setChecking(false);
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    clearAuthCredentials();
    setAuthenticated(false);
  };

  if (checking) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <>
        <Helmet>
          <title>Admin Login - CrackBuster</title>
        </Helmet>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - CrackBuster</title>
      </Helmet>
      <div className="admin">
        <div className="admin-sidebar">
          <div className="admin-header">
            <h2>CrackBuster Admin</h2>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <nav className="admin-nav">
            <Link
              to="/admin/content"
              className={location.pathname.includes('/content') ? 'active' : ''}
            >
              Content
            </Link>
            <Link
              to="/admin/images"
              className={location.pathname.includes('/images') ? 'active' : ''}
            >
              Images
            </Link>
            <Link
              to="/admin/requests"
              className={location.pathname.includes('/requests') ? 'active' : ''}
            >
              Requests
            </Link>
            <Link
              to="/admin/settings"
              className={location.pathname.includes('/settings') ? 'active' : ''}
            >
              Settings
            </Link>
            <Link
              to="/admin/seo"
              className={location.pathname.includes('/seo') ? 'active' : ''}
            >
              SEO
            </Link>
          </nav>
        </div>
        <div className="admin-content">
          <Routes>
            <Route path="/content/*" element={<AdminContent />} />
            <Route path="/images/*" element={<AdminImages />} />
            <Route path="/requests" element={<AdminRequests />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/seo" element={<AdminSEO />} />
            <Route path="/" element={
              <div className="admin-dashboard">
                <h1>Admin Dashboard</h1>
                <p>Select a section from the sidebar to manage content.</p>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default Admin;

