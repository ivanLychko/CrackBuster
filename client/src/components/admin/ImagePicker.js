import React, { useState, useEffect, useRef } from 'react';
import './ImagePicker.scss';

const ImagePicker = ({ value, onChange, category = 'general', label = 'Image' }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(category);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showPicker) {
      fetchImages(currentCategory);
    }
  }, [showPicker, currentCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/images/categories/list', {
        credentials: 'include'
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchImages = async (cat) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/images/${cat}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    uploadImage(files[0]);
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('images', file);
      formData.append('category', currentCategory);

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      if (response.ok && data.images && data.images.length > 0) {
        const uploadedImage = data.images[0];
        onChange(uploadedImage.url);
        setShowPicker(false);
        fetchImages(currentCategory);
      } else {
        alert('Error: ' + (data.error || 'Upload failed'));
      }
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectImage = (imageUrl) => {
    onChange(imageUrl);
    setShowPicker(false);
  };

  const handleRemoveImage = () => {
    onChange('');
  };

  return (
    <div className="image-picker">
      <label>{label}</label>
      <div className="image-picker-preview">
        {value ? (
          <div className="image-preview">
            <img src={value} alt="Preview" />
            <div className="image-actions">
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="btn-small btn-secondary"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="btn-small btn-danger"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="image-placeholder">
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="btn btn-primary"
            >
              Select Image
            </button>
          </div>
        )}
      </div>

      {showPicker && (
        <div
          className="image-picker-modal"
          onClick={(e) => {
            // Close if click is directly on modal overlay (not on content)
            if (e.target === e.currentTarget) {
              setShowPicker(false);
            }
          }}
        >
          <div className="picker-content" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Select Image</h3>
              <button
                className="picker-close"
                onClick={() => setShowPicker(false)}
              >
                ×
              </button>
            </div>

            <div className="picker-body">
              <div className="picker-sidebar">
                <div className="category-selector">
                  <label>Category:</label>
                  <select
                    value={currentCategory}
                    onChange={(e) => setCurrentCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="upload-section">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="picker-upload"
                  />
                  <label htmlFor="picker-upload" className="btn btn-secondary">
                    {uploading ? 'Uploading...' : '+ Upload New'}
                  </label>
                </div>
              </div>

              <div className="picker-images">
                {loading ? (
                  <div className="loading">Loading images...</div>
                ) : images.length === 0 ? (
                  <div className="empty">No images in this category</div>
                ) : (
                  <div className="images-grid">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className={`image-item ${value === image.url ? 'selected' : ''}`}
                        onClick={() => handleSelectImage(image.url)}
                      >
                        <img src={image.url} alt={image.name} />
                        <div className="image-overlay">
                          <span className="image-name">{image.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePicker;




