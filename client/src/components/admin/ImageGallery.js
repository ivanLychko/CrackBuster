import React, { useState, useEffect, useRef } from 'react';
import './ImageGallery.scss';

const ImageGallery = ({ value = [], onChange, category = 'jobs', label = 'Images' }) => {
  // Ensure value is always an array
  const selectedImages = Array.isArray(value) ? value : [];
  const [showPicker, setShowPicker] = useState(false);
  const [images, setImages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentSubfolder, setCurrentSubfolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(category);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showPicker) {
      fetchImages(currentCategory, currentSubfolder);
    }
  }, [showPicker, currentCategory, currentSubfolder]);

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

  const fetchImages = async (cat, subfolder = '') => {
    setLoading(true);
    try {
      const url = subfolder
        ? `/api/admin/images/${cat}?subfolder=${encodeURIComponent(subfolder)}`
        : `/api/admin/images/${cat}`;
      const response = await fetch(url, {
        credentials: 'include'
      });
      const data = await response.json();
      setImages(data.images || []);
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderPath) => {
    setCurrentSubfolder(folderPath);
  };

  const handleCategoryChange = (cat) => {
    setCurrentCategory(cat);
    setCurrentSubfolder(''); // Reset subfolder when changing category
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    uploadImages(files);
  };

  const uploadImages = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      formData.append('category', currentCategory);
      if (currentSubfolder) {
        formData.append('subfolder', currentSubfolder);
      }

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      if (response.ok && data.images && data.images.length > 0) {
        const newImages = [...selectedImages, ...data.images.map(img => img.url)];
        onChange(newImages);
        setShowPicker(false);
        fetchImages(currentCategory, currentSubfolder);
      } else {
        alert('Error: ' + (data.error || 'Upload failed'));
      }
    } catch (error) {
      alert('Error uploading images: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectImages = (imageUrl) => {
    if (selectedImages.includes(imageUrl)) {
      // If already selected, deselect it
      onChange(selectedImages.filter(url => url !== imageUrl));
    } else {
      // If not selected, add it
      onChange([...selectedImages, imageUrl]);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newImages = [...selectedImages];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    onChange(newImages);
    setDraggedIndex(null);
  };

  return (
    <div className="image-gallery">
      <label>{label}</label>
      <div className="gallery-preview">
        {selectedImages && selectedImages.length > 0 ? (
          <div className="gallery-grid">
            {selectedImages.map((imageUrl, index) => (
              <div
                key={index}
                className="gallery-item"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <img src={imageUrl} alt={`Gallery ${index + 1}`} />
                <div className="item-number">{index + 1}</div>
                <button
                  type="button"
                  className="item-remove"
                  onClick={() => handleRemoveImage(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="gallery-empty">
            <p>No images selected</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="btn btn-primary"
        >
          + Add Images
        </button>
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
              <h3>Select Images</h3>
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
                    onChange={(e) => handleCategoryChange(e.target.value)}
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
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="gallery-upload"
                  />
                  <label htmlFor="gallery-upload" className="btn btn-secondary">
                    {uploading ? 'Uploading...' : '+ Upload New'}
                  </label>
                </div>
              </div>

              <div className="picker-images">
                {loading ? (
                  <div className="loading">Loading images...</div>
                ) : (
                  <>
                    {/* Breadcrumb navigation */}
                    {(currentSubfolder || folders.length > 0 || images.length > 0) && (
                      <div className="folder-breadcrumb">
                        <button
                          onClick={() => {
                            setCurrentSubfolder('');
                          }}
                          className="breadcrumb-item"
                        >
                          {currentCategory}
                        </button>
                        {currentSubfolder && currentSubfolder.split('/').map((folder, index, arr) => {
                          const path = arr.slice(0, index + 1).join('/');
                          return (
                            <React.Fragment key={path}>
                              <span className="breadcrumb-separator">/</span>
                              <button
                                onClick={() => handleFolderClick(path)}
                                className="breadcrumb-item"
                              >
                                {folder}
                              </button>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {/* Folders list */}
                    {folders.length > 0 && (
                      <div className="folders-section">
                        <div className="folders-grid">
                          {folders.map((folder, index) => (
                            <div
                              key={index}
                              className="folder-item"
                              onClick={() => handleFolderClick(folder.path)}
                            >
                              <div className="folder-icon">📁</div>
                              <div className="folder-name">{folder.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Images section */}
                    {images.length === 0 && folders.length === 0 ? (
                      <div className="empty">No images or folders in this location</div>
                    ) : images.length > 0 ? (
                      <div className="images-grid">
                        {images.map((image, index) => {
                          const isSelected = selectedImages.includes(image.url);
                          return (
                            <div
                              key={index}
                              className={`image-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleSelectImages(image.url)}
                            >
                              <img src={image.url} alt={image.name} />
                              {isSelected && (
                                <div className="selected-badge">✓</div>
                              )}
                              <div className="image-overlay">
                                <span className="image-name">{image.name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

