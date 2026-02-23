import React, { useState, useEffect, useCallback } from 'react';
import Lightbox from './Lightbox';
import './GoogleReviews.scss';

const REVIEWS_PER_PAGE = 9;
const TEXT_TRUNCATE_LENGTH = 120;

const GoogleReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [writeReviewUrl, setWriteReviewUrl] = useState('#');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchReviews = useCallback(async (pageNum = 1) => {
    try {
      const response = await fetch(`/api/google-reviews?page=${pageNum}&perPage=${REVIEWS_PER_PAGE}`);
      const data = await response.json();

      if (data.enabled && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
        setEnabled(true);
        setTotalCount(data.totalCount || 0);
        setAverageRating(data.averageRating ?? 0);
        setPage(data.page || 1);
        setTotalPages(Math.ceil((data.totalCount || 0) / REVIEWS_PER_PAGE) || 1);
        setWriteReviewUrl(data.writeReviewUrl && data.writeReviewUrl.trim() ? data.writeReviewUrl : '#');
      } else {
        setEnabled(false);
        setWriteReviewUrl(data.writeReviewUrl && data.writeReviewUrl.trim() ? data.writeReviewUrl : '#');
      }
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const openReviewImages = (review) => {
    if (!hasImages(review)) return;
    setLightboxImages(review.images);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, totalPages));
    if (next === page) return;
    setLoading(true);
    setPage(next);
    fetchReviews(next).then(() => setLoading(false));
  };

  const getInitials = (name) => {
    if (!name || !name.trim()) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const r = Math.min(5, Math.max(0, Number(rating) || 0));
    const full = Math.floor(r);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`star ${i < full ? 'star-full' : 'star-empty'}`}>★</span>
      );
    }
    return stars;
  };

  const hasImages = (review) => Array.isArray(review.images) && review.images.length > 0;

  if (loading && reviews.length === 0) {
    return null;
  }

  if (!enabled || !reviews.length) {
    return null;
  }

  const showPaginator = totalPages > 1;
  const paginationStart = Math.max(1, page - 2);
  const paginationEnd = Math.min(totalPages, page + 2);
  const pages = [];
  for (let i = paginationStart; i <= paginationEnd; i++) pages.push(i);

  return (
    <section className="google-reviews-section">
      <div className="gr-container">
        <header className="gr-header">
          <h2 className="gr-title">What our clients say about us</h2>
          <div className="gr-header-right">
            <div className="gr-rating-block">
              <span className="gr-rating-number">{averageRating.toFixed(2)}</span>
              <div className="gr-stars">{renderStars(averageRating)}</div>
              <span className="gr-review-count">{totalCount} reviews</span>
            </div>
            {writeReviewUrl && writeReviewUrl !== '#' && (
              <a
                href={writeReviewUrl}
                className="gr-write-review-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Write a review
              </a>
            )}
          </div>
        </header>

        <div className="gr-cards-wrap">
          {loading ? (
            <div className="gr-loading">Loading...</div>
          ) : (
            <div className="gr-cards">
              {reviews.map((review, index) => {
                const id = review._id || index;
                const isExpanded = expandedId === id;
                const text = review.text || '';
                const needsMore = text.length > TEXT_TRUNCATE_LENGTH;
                const displayText = needsMore && !isExpanded
                  ? text.slice(0, TEXT_TRUNCATE_LENGTH) + '...'
                  : text;
                return (
                  <article key={id} className="gr-card">
                    <div className="gr-card-top">
                      <div className="gr-card-rating">
                        <span className="gr-card-rating-num">{review.rating}</span>
                        <span className="gr-card-stars">{renderStars(review.rating)}</span>
                      </div>
                      <div className="gr-card-top-right">
                        {hasImages(review) && (
                          <button
                            type="button"
                            className="gr-card-attachment"
                            onClick={() => openReviewImages(review)}
                            title="View images"
                            aria-label="View review images"
                          >
                            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                              <path fill="currentColor" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                            </svg>
                            <span className="gr-attachment-count">{review.images.length}</span>
                          </button>
                        )}
                        <time className="gr-card-date" dateTime={review.reviewTime}>
                          {formatDate(review.reviewTime)}
                        </time>
                      </div>
                    </div>
                    {text && (
                      <div className="gr-card-text">
                        <p>{displayText}</p>
                        {needsMore && (
                          <button
                            type="button"
                            className="gr-more"
                            onClick={() => setExpandedId(isExpanded ? null : id)}
                          >
                            {isExpanded ? 'Less' : 'More'}
                          </button>
                        )}
                      </div>
                    )}
                    <div className="gr-card-footer">
                      <div className="gr-card-author">
                        <div className="gr-avatar">{getInitials(review.authorName)}</div>
                        <span className="gr-author-name">{review.authorName}</span>
                      </div>
                      <div className="gr-google-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.78h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.78c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {showPaginator && !loading && (
          <nav className="gr-pagination" aria-label="Reviews pagination">
            <button
              type="button"
              className="gr-pagination-prev"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            <div className="gr-pagination-pages">
              {paginationStart > 1 && (
                <>
                  <button type="button" className="gr-pagination-page" onClick={() => goToPage(1)}>1</button>
                  {paginationStart > 2 && <span className="gr-pagination-ellipsis">…</span>}
                </>
              )}
              {pages.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`gr-pagination-page ${p === page ? 'active' : ''}`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ))}
              {paginationEnd < totalPages && (
                <>
                  {paginationEnd < totalPages - 1 && <span className="gr-pagination-ellipsis">…</span>}
                  <button type="button" className="gr-pagination-page" onClick={() => goToPage(totalPages)}>{totalPages}</button>
                </>
              )}
            </div>
            <button
              type="button"
              className="gr-pagination-next"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              ›
            </button>
          </nav>
        )}

        <p className="gr-attribution">Google Reviews</p>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={() => setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)}
          onPrev={() => setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)}
        />
      )}
    </section>
  );
};

export default GoogleReviews;
