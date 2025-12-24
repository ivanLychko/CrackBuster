import React, { useState } from 'react';
import AdminEstimateRequests from './AdminEstimateRequests';
import AdminContactRequests from './AdminContactRequests';
import './AdminRequests.scss';

const AdminRequests = () => {
  const [activeTab, setActiveTab] = useState('estimate');

  return (
    <div className="admin-requests">
      <div className="admin-requests-header">
        <h1>Requests</h1>
      </div>
      
      <div className="admin-requests-tabs">
        <button
          className={`tab-button ${activeTab === 'estimate' ? 'active' : ''}`}
          onClick={() => setActiveTab('estimate')}
        >
          Estimate Requests
        </button>
        <button
          className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Requests
        </button>
      </div>

      <div className="admin-requests-content">
        {activeTab === 'estimate' && <AdminEstimateRequests />}
        {activeTab === 'contact' && <AdminContactRequests />}
      </div>
    </div>
  );
};

export default AdminRequests;

