import React, { useState, useEffect } from 'react';
import Lightbox from '../Lightbox';
import './AdminCommon.scss';

const AdminEstimateRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/estimate-requests', {
        credentials: 'include'
      });
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching estimate requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/admin/estimate-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchRequests();
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
        }
      } else {
        alert('Error updating status');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this estimate request?')) return;

    try {
      const response = await fetch(`/api/admin/estimate-requests/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchRequests();
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest(null);
        }
      } else {
        alert('Error deleting request');
      }
    } catch (error) {
      alert('Error: ' + error.message);
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
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '600',
        backgroundColor: statusColors[status] + '20',
        color: statusColors[status]
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

  const openLightbox = (images, startIndex = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Estimate Requests</h1>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          Total: {requests.length}
        </div>
      </div>

      {requests.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          No estimate requests found.
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
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    border: selectedRequest?._id === request._id ? '2px solid #031167' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedRequest?._id === request._id ? 'rgba(3, 17, 103, 0.05)' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, color: '#031167', fontSize: '1.1rem' }}>
                      {request.name}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                    {request.email}
                  </p>
                  {request.phone && (
                    <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                      {request.phone}
                    </p>
                  )}
                  <p style={{ margin: '0.5rem 0', color: '#999', fontSize: '0.85rem' }}>
                    {formatDate(request.createdAt)}
                  </p>
                  {request.images && request.images.length > 0 && (
                    <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.85rem' }}>
                      📷 {request.images.length} image{request.images.length !== 1 ? 's' : ''}
                    </p>
                  )}
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

                {selectedRequest.address && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#031167', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Address
                    </label>
                    <p style={{ margin: 0, padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                      {selectedRequest.address}
                    </p>
                  </div>
                )}

                {selectedRequest.description && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#031167', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Description
                    </label>
                    <p style={{ margin: 0, padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', whiteSpace: 'pre-wrap' }}>
                      {selectedRequest.description}
                    </p>
                  </div>
                )}

                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#031167', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Images ({selectedRequest.images.length})
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '1rem'
                    }}>
                      {selectedRequest.images.map((imagePath, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <img
                            src={imagePath}
                            alt={`Estimate ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              cursor: 'pointer',
                              transition: 'transform 0.2s'
                            }}
                            onClick={() => openLightbox(selectedRequest.images, index)}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                            }}
                            onError={(e) => {
                              e.target.src = '/images/placeholder.jpg';
                            }}
                          />
                        </div>
                      ))}
                    </div>
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

      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </div>
  );
};

export default AdminEstimateRequests;

