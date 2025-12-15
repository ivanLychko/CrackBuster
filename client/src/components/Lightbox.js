import React, { useEffect } from 'react';
import './Lightbox.scss';

const Lightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onNext, onPrev]);

  if (!images || images.length === 0 || currentIndex === null) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        {images.length > 1 && (
          <>
            <button 
              className="lightbox-nav lightbox-prev" 
              onClick={onPrev}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button 
              className="lightbox-nav lightbox-next" 
              onClick={onNext}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        <div className="lightbox-image-container">
          <img 
            src={currentImage} 
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            className="lightbox-image"
            onError={(e) => {
              // Try alternative formats
              const src = e.target.src;
              if (src && !src.endsWith('.webp')) {
                const webpSrc = src.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
                e.target.src = webpSrc;
                return;
              }
              // If still fails, show placeholder
              e.target.style.display = 'none';
              e.target.onerror = null;
            }}
          />
        </div>

        {images.length > 1 && (
          <div className="lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lightbox;

