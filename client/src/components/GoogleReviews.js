import React, { useState, useEffect } from 'react';
import './GoogleReviews.scss';

const GoogleReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/google-reviews');
      const data = await response.json();
      
      if (data.enabled && data.reviews) {
        setReviews(data.reviews);
        setEnabled(true);
      }
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star star-full">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star star-half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star star-empty">★</span>);
    }

    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return null;
  }

  if (!enabled || !reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="google-reviews-section">
      <div className="container">
        <div className="reviews-header">
          <h2>What Our Customers Say</h2>
          <div className="google-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.78h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.78c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google Reviews</span>
          </div>
        </div>

        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <div key={review._id || index} className="review-card">
              <div className="review-header">
                <div className="review-author">
                  {review.authorPhoto ? (
                    <img 
                      src={review.authorPhoto} 
                      alt={review.authorName}
                      className="author-photo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="author-photo-placeholder">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="author-info">
                    <div className="author-name">{review.authorName}</div>
                    <div className="review-date">{formatDate(review.reviewTime)}</div>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                  <span className="rating-number">{review.rating}</span>
                </div>
              </div>
              {review.text && (
                <div className="review-text">
                  <p>{review.text}</p>
                </div>
              )}
              {review.authorUrl && (
                <a 
                  href={review.authorUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="review-link"
                >
                  View on Google
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;

