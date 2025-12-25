import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import './AdminCommon.scss';

const AdminContactRequests = () => {
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/contact-requests');
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await authenticatedFetch(`/api/admin/contact-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchRequests();
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
        }
      } else {
        showError('Error updating status');
      }
    } catch (error) {
      showError('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contact request?')) return;

    try {
      const response = await authenticatedFetch(`/api/admin/contact-requests/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchRequests();
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest(null);
        }
      } else {
        showError('Error deleting request');
      }
    } catch (error) {
      showError('Error: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      new: '#007bff',
      contacted: '#ffc107',
      completed: '#28a745'
    };
    const statusLabels = {
      new: 'New',
      contacted: 'Contacted',
      completed: 'Completed'
    };

    return (
      <span style={{
        padding: '0.2rem 0.5rem',
        borderRadius: '10px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: statusColors[status] + '20',
        color: statusColors[status],
        whiteSpace: 'nowrap'
      }}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header" style={{ marginBottom: '1rem' }}>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          Total: {requests.length}
        </div>
      </div>

      {requests.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          No contact requests found.
        </p>
      ) : (
        <div className="estimate-requests-layout">
          {/* List View */}
          <div className="admin-list estimate-requests-list">
            <h2>All Requests</h2>
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {requests.map(request => (
                <div
                  key={request._id}
                  onClick={() => setSelectedRequest(request)}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    border: selectedRequest?._id === request._id ? '2px solid #031167' : '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: selectedRequest?._id === request._id ? 'rgba(3, 17, 103, 0.05)' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h3 style={{ margin: 0, color: '#031167', fontSize: '0.95rem', fontWeight: '600' }}>
                      {request.name}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#666' }}>
                    <span>{request.email}</span>
                    {request.phone && <span>• {request.phone}</span>}
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#999', fontSize: '0.75rem' }}>
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Detail View */}
          <div className="estimate-requests-detail">
            {selectedRequest ? (
              <div style={{
                background: 'rgba(248, 249, 250, 0.5)',
                padding: '2rem',
                borderRadius: '12px',
                position: 'sticky',
                top: '2rem',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, color: '#031167' }}>Request Details</h2>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#031167', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Status
                  </label>
                  <select
                    value={selectedRequest.status}
                    onChange={(e) => handleStatusChange(selectedRequest._id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#031167', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Name
                  </label>
                  <p style={{ margin: 0, padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                    {selectedRequest.name}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#031167', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Email
                  </label>
                  <p style={{ margin: 0, padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <a href={`mailto:${selectedRequest.email}`} style={{ color: '#031167' }}>
                      {selectedRequest.email}
                    </a>
                  </p>
                </div>

                {selectedRequest.phone && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#031167', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Phone
                    </label>
                    <p style={{ margin: 0, padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                      <a href={`tel:${selectedRequest.phone}`} style={{ color: '#031167' }}>
                        {selectedRequest.phone}
                      </a>
                    </p>
                  </div>
                )}

                {selectedRequest.message && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#031167', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Message
                    </label>
                    <p style={{ margin: 0, padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', whiteSpace: 'pre-wrap' }}>
                      {selectedRequest.message}
                    </p>
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#031167', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Submitted
                  </label>
                  <p style={{ margin: 0, padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', color: '#666' }}>
                    {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #ddd' }}>
                  <button
                    onClick={() => handleDelete(selectedRequest._id)}
                    className="btn btn-danger"
                    style={{ width: '100%' }}
                  >
                    Delete Request
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(248, 249, 250, 0.5)',
                padding: '3rem',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666'
              }}>
                <p>Select a request from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactRequests;

