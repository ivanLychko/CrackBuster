import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import AdminServices from '../components/admin/AdminServices';
import AdminBlog from '../components/admin/AdminBlog';
import AdminWorks from '../components/admin/AdminWorks';
import AdminImages from '../components/admin/AdminImages';
import AdminEstimateRequests from '../components/admin/AdminEstimateRequests';
import AdminSettings from '../components/admin/AdminSettings';
import './Admin.scss';

const Admin = () => {
  const location = useLocation();

  return (
    <>
      <Helmet>
        <title>Admin Panel - CrackBuster</title>
      </Helmet>
      <div className="admin">
        <div className="admin-sidebar">
          <div className="admin-header">
            <h2>CrackBuster Admin</h2>
          </div>
          <nav className="admin-nav">
            <Link
              to="/admin/services"
              className={location.pathname.includes('/services') ? 'active' : ''}
            >
              Services
            </Link>
            <Link
              to="/admin/blog"
              className={location.pathname.includes('/blog') ? 'active' : ''}
            >
              Blog Posts
            </Link>
            <Link
              to="/admin/works"
              className={location.pathname.includes('/works') ? 'active' : ''}
            >
              Works Gallery
            </Link>
            <Link
              to="/admin/images"
              className={location.pathname.includes('/images') ? 'active' : ''}
            >
              Images
            </Link>
            <Link
              to="/admin/estimate-requests"
              className={location.pathname.includes('/estimate-requests') ? 'active' : ''}
            >
              Estimate Requests
            </Link>
            <Link
              to="/admin/settings"
              className={location.pathname.includes('/settings') ? 'active' : ''}
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="admin-content">
          <Routes>
            <Route path="/services/*" element={<AdminServices />} />
            <Route path="/blog/*" element={<AdminBlog />} />
            <Route path="/works/*" element={<AdminWorks />} />
            <Route path="/images/*" element={<AdminImages />} />
            <Route path="/estimate-requests" element={<AdminEstimateRequests />} />
            <Route path="/settings" element={<AdminSettings />} />
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

