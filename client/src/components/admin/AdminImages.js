import React, { useState, useEffect, useRef } from 'react';
import { authenticatedFetch } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';
import './AdminCommon.scss';
import './AdminImages.scss';

const AdminImages = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('general');
  const [currentSubfolder, setCurrentSubfolder] = useState('');
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizingImage, setOptimizingImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentCategory && categories.length > 0) {
      fetchImages(currentCategory, currentSubfolder);
    }
  }, [currentCategory, currentSubfolder, categories.length]);

  const fetchCategories = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/images/categories/list');
      const data = await response.json();
      const cats = data.categories || [];
      setCategories(cats);
      if (cats.length > 0 && !cats.includes(currentCategory)) {
        setCurrentCategory(cats[0]);
      } else if (cats.length === 0) {
        // If no categories exist, set to 'general' which will be created on first upload
        setCurrentCategory('general');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchImages = async (category, subfolder = '') => {
    setLoading(true);
    try {
      const url = subfolder
        ? `/api/admin/images/${category}?subfolder=${encodeURIComponent(subfolder)}`
        : `/api/admin/images/${category}`;
      const response = await authenticatedFetch(url);
      const data = await response.json();
      setImages(data.images || []);
      setFolders(data.folders || []);

      // Preload folder images for instant checkbox checking
      if (data.folders && data.folders.length > 0) {
        data.folders.forEach(async (folder) => {
          // folder.path already includes subfolder if we're in a subfolder
          const fullFolderPath = folder.path;
          if (!folderImagesCache[fullFolderPath]) {
            try {
              const folderUrl = `/api/admin/images/folder/${category}/images?subfolder=${encodeURIComponent(fullFolderPath)}`;
              const folderResponse = await authenticatedFetch(folderUrl);
              const folderData = await folderResponse.json();
              setFolderImagesCache(prev => ({
                ...prev,
                [fullFolderPath]: folderData.images || []
              }));
            } catch (error) {
              console.error(`Error preloading folder ${fullFolderPath}:`, error);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      showError('Error loading images: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderPath) => {
    setCurrentSubfolder(folderPath);
    setSelectedImages([]); // Clear selection when navigating
  };

  const handleBackToParent = () => {
    if (currentSubfolder) {
      const parentPath = currentSubfolder.split('/').slice(0, -1).join('/');
      setCurrentSubfolder(parentPath);
      setSelectedImages([]);
    }
  };

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
    setCurrentSubfolder(''); // Reset subfolder when changing category
    setSelectedImages([]);
    setFolderImagesCache({}); // Clear cache when changing category
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

      const response = await authenticatedFetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        showSuccess(`Successfully uploaded ${data.images.length} image(s)`);
        fetchImages(currentCategory, currentSubfolder);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        showError('Error: ' + (data.error || 'Upload failed'));
      }
    } catch (error) {
      showError('Error uploading images: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imagePath, imageName) => {
    if (!confirm(`Are you sure you want to delete "${imageName}"?`)) return;

    try {
      const pathParts = imagePath.split('/');
      const category = pathParts[0];
      const filename = pathParts.slice(1).join('/'); // Handle subfolders
      const encodedCategory = encodeURIComponent(category);
      const encodedFilename = encodeURIComponent(filename);
      const response = await authenticatedFetch(`/api/admin/images/${encodedCategory}/${encodedFilename}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showSuccess('Image deleted successfully');
        fetchImages(currentCategory, currentSubfolder);
      } else {
        const data = await response.json();
        showError('Error: ' + (data.error || 'Delete failed'));
      }
    } catch (error) {
      showError('Error deleting image: ' + error.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) return;

    try {
      for (const imagePath of selectedImages) {
        const pathParts = imagePath.split('/');
        const category = pathParts[0];
        const filename = pathParts.slice(1).join('/'); // Handle subfolders
        const encodedCategory = encodeURIComponent(category);
        const encodedFilename = encodeURIComponent(filename);
        await authenticatedFetch(`/api/admin/images/${encodedCategory}/${encodedFilename}`, {
          method: 'DELETE'
        });
      }
      showSuccess('Selected images deleted successfully');
      setSelectedImages([]);
      fetchImages(currentCategory);
    } catch (error) {
      showError('Error deleting images: ' + error.message);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showWarning('Please enter a category name');
      return;
    }

    try {
      const response = await authenticatedFetch('/api/admin/images/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      const data = await response.json();
      if (response.ok) {
        showSuccess('Category created successfully');
        setNewCategoryName('');
        fetchCategories();
        setCurrentCategory(data.category);
      } else {
        showError('Error: ' + (data.error || 'Failed to create category'));
      }
    } catch (error) {
      showError('Error creating category: ' + error.message);
    }
  };

  const toggleImageSelection = (imagePath) => {
    setSelectedImages(prev =>
      prev.includes(imagePath)
        ? prev.filter(p => p !== imagePath)
        : [...prev, imagePath]
    );
  };

  // Check if image is already optimized (WebP files are considered optimized)
  const isImageOptimized = (imagePath) => {
    const ext = imagePath.toLowerCase().split('.').pop();
    return ext === 'webp';
  };

  // Get only optimizable images (exclude WebP)
  const getOptimizableImages = () => {
    return images.filter(img => !isImageOptimized(img.path));
  };

  const handleSelectAll = () => {
    // Only select images that can be optimized (exclude WebP)
    const optimizableImagePaths = getOptimizableImages().map(img => img.path);
    setSelectedImages(optimizableImagePaths);
  };

  const handleDeselectAll = () => {
    setSelectedImages([]);
  };

  const [folderImagesCache, setFolderImagesCache] = useState({});

  const handleSelectFolder = async (folderPath, checked) => {
    try {
      // Use full path including current subfolder if exists
      const fullFolderPath = currentSubfolder ? `${currentSubfolder}/${folderPath}` : folderPath;

      // Check cache first
      let folderImages = folderImagesCache[fullFolderPath];

      if (!folderImages) {
        const url = `/api/admin/images/folder/${currentCategory}/images?subfolder=${encodeURIComponent(fullFolderPath)}`;
        const response = await authenticatedFetch(url);
        const data = await response.json();
        folderImages = data.images || [];
        // Cache the result
        setFolderImagesCache(prev => ({
          ...prev,
          [fullFolderPath]: folderImages
        }));
      }

      // Filter out already optimized images (WebP)
      const optimizableFolderImages = folderImages.filter(img => !isImageOptimized(img.path));
      const folderImagePaths = optimizableFolderImages.map(img => img.path);

      if (checked) {
        // Add folder images to selection (only optimizable ones)
        setSelectedImages(prev => {
          const combined = [...new Set([...prev, ...folderImagePaths])];
          return combined;
        });
      } else {
        // Remove folder images from selection
        setSelectedImages(prev => prev.filter(path => !folderImagePaths.includes(path)));
      }
    } catch (error) {
      console.error('Error selecting folder images:', error);
    }
  };

  const isFolderSelected = (folderPath) => {
    // Use full path including current subfolder if exists
    const fullFolderPath = currentSubfolder ? `${currentSubfolder}/${folderPath}` : folderPath;
    const cachedImages = folderImagesCache[fullFolderPath];

    if (!cachedImages || cachedImages.length === 0) {
      // If not cached yet, check if we can determine from current selection
      // This handles the case when folder images are already selected but not cached
      return false;
    }

    // Only consider optimizable images (exclude WebP)
    const optimizableFolderImages = cachedImages.filter(img => !isImageOptimized(img.path));
    const folderImagePaths = optimizableFolderImages.map(img => img.path);
    return folderImagePaths.length > 0 && folderImagePaths.every(path => selectedImages.includes(path));
  };

  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      showSuccess('Image URL copied to clipboard!');
    }).catch(() => {
      showError('Failed to copy URL to clipboard');
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleOptimize = async (imagePath, imageName) => {
    if (optimizing) return;
    
    // Check if already optimized
    if (isImageOptimized(imagePath)) {
      showWarning('This image is already optimized (WebP format) and cannot be optimized again.');
      return;
    }

    setOptimizing(true);
    setOptimizingImage(imagePath);

    try {
      const pathParts = imagePath.split('/');
      const category = pathParts[0];
      const filename = pathParts.slice(1).join('/'); // Handle subfolders
      const encodedCategory = encodeURIComponent(category);
      const encodedFilename = encodeURIComponent(filename);
      const response = await authenticatedFetch(`/api/admin/images/optimize/${encodedCategory}/${encodedFilename}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality: 85 })
      });

      const data = await response.json();
      if (response.ok) {
        const saved = data.result.savedPercent;
        showSuccess(`Image optimized successfully! Saved ${saved}% (${formatFileSize(data.result.savedBytes)})`);
        fetchImages(currentCategory, currentSubfolder);
      } else {
        showError('Error: ' + (data.error || 'Optimization failed'));
      }
    } catch (error) {
      showError('Error optimizing image: ' + error.message);
    } finally {
      setOptimizing(false);
      setOptimizingImage(null);
    }
  };

  const handleWebOptimize = async (imagePath, imageName) => {
    if (optimizing) return;
    
    // Check if already optimized
    if (isImageOptimized(imagePath)) {
      showWarning('This image is already optimized (WebP format) and cannot be optimized again.');
      return;
    }

    setOptimizing(true);
    setOptimizingImage(imagePath);

    try {
      const pathParts = imagePath.split('/');
      const category = pathParts[0];
      const filename = pathParts.slice(1).join('/'); // Handle subfolders
      const encodedCategory = encodeURIComponent(category);
      const encodedFilename = encodeURIComponent(filename);
      const response = await authenticatedFetch(`/api/admin/images/optimize/web/${encodedCategory}/${encodedFilename}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 85
        })
      });

      const data = await response.json();
      if (response.ok) {
        const saved = data.result.savedPercent;
        showSuccess(`Image optimized for web! Saved ${saved}% (${formatFileSize(data.result.savedBytes)}). Converted to WebP format.`);
        fetchImages(currentCategory, currentSubfolder);
      } else {
        showError('Error: ' + (data.error || 'Web optimization failed'));
      }
    } catch (error) {
      showError('Error optimizing image: ' + error.message);
    } finally {
      setOptimizing(false);
      setOptimizingImage(null);
    }
  };

  const handleOptimizeSelected = async () => {
    if (selectedImages.length === 0 || optimizing) return;
    
    // Filter out already optimized images
    const optimizableImages = selectedImages.filter(path => !isImageOptimized(path));
    
    if (optimizableImages.length === 0) {
      showWarning('No optimizable images selected. WebP images are already optimized.');
      return;
    }
    
    if (optimizableImages.length < selectedImages.length) {
      const skipped = selectedImages.length - optimizableImages.length;
      if (!confirm(`Optimize ${optimizableImages.length} image(s)? ${skipped} already optimized image(s) will be skipped.`)) return;
    } else {
      if (!confirm(`Optimize ${optimizableImages.length} image(s)?`)) return;
    }

    setOptimizing(true);

    try {
      const response = await authenticatedFetch('/api/admin/images/optimize/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: optimizableImages,
          quality: 85
        })
      });

      const data = await response.json();
      if (response.ok) {
        const totalSaved = data.results.reduce((sum, r) => sum + r.savedBytes, 0);
        const avgSaved = data.results.length > 0
          ? (data.results.reduce((sum, r) => sum + parseFloat(r.savedPercent), 0) / data.results.length).toFixed(1)
          : 0;
        showSuccess(`Optimized ${data.results.length} image(s)! Average saved: ${avgSaved}% (Total: ${formatFileSize(totalSaved)})`);
        setSelectedImages([]);
        fetchImages(currentCategory, currentSubfolder);
      } else {
        showError('Error: ' + (data.error || 'Bulk optimization failed'));
      }
    } catch (error) {
      showError('Error optimizing images: ' + error.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handleWebOptimizeSelected = async () => {
    if (selectedImages.length === 0 || optimizing) return;
    
    // Filter out already optimized images
    const optimizableImages = selectedImages.filter(path => !isImageOptimized(path));
    
    if (optimizableImages.length === 0) {
      showWarning('No optimizable images selected. WebP images are already optimized.');
      return;
    }
    
    if (optimizableImages.length < selectedImages.length) {
      const skipped = selectedImages.length - optimizableImages.length;
      if (!confirm(`Web optimize ${optimizableImages.length} image(s)? This will convert them to WebP format. ${skipped} already optimized image(s) will be skipped.`)) return;
    } else {
      if (!confirm(`Web optimize ${optimizableImages.length} image(s)? This will convert them to WebP format.`)) return;
    }

    setOptimizing(true);

    try {
      const response = await authenticatedFetch('/api/admin/images/optimize/web/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: optimizableImages,
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 85
        })
      });

      const data = await response.json();
      if (response.ok) {
        const totalSaved = data.results.reduce((sum, r) => sum + r.savedBytes, 0);
        const avgSaved = data.results.length > 0
          ? (data.results.reduce((sum, r) => sum + parseFloat(r.savedPercent), 0) / data.results.length).toFixed(1)
          : 0;
        showSuccess(`Web optimized ${data.results.length} image(s)! Average saved: ${avgSaved}% (Total: ${formatFileSize(totalSaved)}). All converted to WebP.`);
        setSelectedImages([]);
        fetchImages(currentCategory, currentSubfolder);
      } else {
        showError('Error: ' + (data.error || 'Bulk web optimization failed'));
      }
    } catch (error) {
      showError('Error optimizing images: ' + error.message);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="admin-section admin-images">
      <div className="admin-section-header">
        <h1>Image Manager</h1>
        <div className="header-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="btn btn-primary">
            {uploading ? 'Uploading...' : '+ Upload Images'}
          </label>
          {selectedImages.length > 0 && (
            <>
              <button
                onClick={handleOptimizeSelected}
                className="btn btn-secondary"
                disabled={optimizing}
              >
                {optimizing ? 'Optimizing...' : `Optimize Selected (${selectedImages.length})`}
              </button>
              <button
                onClick={handleWebOptimizeSelected}
                className="btn btn-primary"
                disabled={optimizing}
              >
                {optimizing ? 'Optimizing...' : `Web Optimize Selected (${selectedImages.length})`}
              </button>
              <button onClick={handleDeleteSelected} className="btn btn-danger">
                Delete Selected ({selectedImages.length})
              </button>
              <button onClick={handleDeselectAll} className="btn btn-secondary">
                Clear Selection
              </button>
            </>
          )}
        </div>
      </div>

      <div className="images-layout">
        <div className="categories-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-item ${currentCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="create-category">
            <input
              type="text"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
            />
            <button onClick={handleCreateCategory} className="btn btn-secondary">
              Create
            </button>
          </div>
        </div>

        <div className="images-content">
          {loading ? (
            <div className="loading">Loading images...</div>
          ) : (
            <>
              {/* Breadcrumb navigation */}
              {(currentSubfolder || folders.length > 0 || images.length > 0) && (
                <div className="folder-breadcrumb">
                  <button
                    onClick={() => handleCategoryChange(currentCategory)}
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
                  <h4>Folders</h4>
                  <div className="folders-grid">
                    {folders.map((folder, index) => {
                      const folderSelected = isFolderSelected(folder.path);
                      return (
                        <div
                          key={index}
                          className={`folder-item ${folderSelected ? 'selected' : ''}`}
                        >
                          <div className="folder-checkbox">
                            <input
                              type="checkbox"
                              checked={folderSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectFolder(folder.path, e.target.checked);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div
                            className="folder-content"
                            onClick={() => handleFolderClick(folder.path)}
                          >
                            <div className="folder-icon">📁</div>
                            <div className="folder-name">{folder.name}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Images section */}
              {images.length === 0 && folders.length === 0 ? (
                <div className="empty-state">
                  <p>No images or folders in this location.</p>
                  <label htmlFor="image-upload" className="btn btn-primary">
                    Upload Images
                  </label>
                </div>
              ) : (
                <>
                  {images.length > 0 && (
                    <>
                      <div className="images-toolbar">
                        <div className="selection-controls">
                          {(() => {
                            const optimizableImages = getOptimizableImages();
                            const allOptimizableSelected = optimizableImages.length > 0 && 
                              optimizableImages.every(img => selectedImages.includes(img.path));
                            
                            return allOptimizableSelected ? (
                              <button onClick={handleDeselectAll} className="btn btn-secondary btn-sm">
                                Deselect All
                              </button>
                            ) : (
                              <button onClick={handleSelectAll} className="btn btn-secondary btn-sm">
                                Select All ({optimizableImages.length} optimizable)
                              </button>
                            );
                          })()}
                          {selectedImages.length > 0 && (
                            <span className="selection-count">
                              {selectedImages.length} selected
                              {images.length > 0 && ` (${getOptimizableImages().length} optimizable of ${images.length} total)`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="images-grid">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className={`image-item ${selectedImages.includes(image.path) ? 'selected' : ''}`}
                          >
                            <div className="image-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedImages.includes(image.path)}
                                onChange={() => toggleImageSelection(image.path)}
                              />
                            </div>
                            <div
                              className="image-preview"
                              onClick={() => setPreviewImage(image)}
                            >
                              <img src={image.url} alt={image.name} />
                            </div>
                            <div className="image-info">
                              <div className="image-name" title={image.name}>
                                {image.name}
                              </div>
                              <div className="image-meta">
                                {formatFileSize(image.size)}
                              </div>
                              <div className="image-actions">
                                <button
                                  onClick={() => handleOptimize(image.path, image.name)}
                                  className="btn-small btn-optimize"
                                  title={isImageOptimized(image.path) ? "Already optimized" : "Optimize"}
                                  disabled={optimizing && optimizingImage !== image.path || isImageOptimized(image.path)}
                                >
                                  {optimizing && optimizingImage === image.path ? '⏳' : '⚡'}
                                </button>
                                <button
                                  onClick={() => handleWebOptimize(image.path, image.name)}
                                  className="btn-small btn-web-optimize"
                                  title={isImageOptimized(image.path) ? "Already optimized" : "Web Optimize (WebP)"}
                                  disabled={optimizing && optimizingImage !== image.path || isImageOptimized(image.path)}
                                >
                                  {optimizing && optimizingImage === image.path ? '⏳' : '🌐'}
                                </button>
                                <button
                                  onClick={() => copyImageUrl(image.url)}
                                  className="btn-small btn-secondary"
                                  title="Copy URL"
                                >
                                  📋
                                </button>
                                <button
                                  onClick={() => handleDelete(image.path, image.name)}
                                  className="btn-small btn-danger"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {previewImage && (
        <div
          className="image-modal"
          onClick={(e) => {
            // Close if click is directly on modal overlay (not on content)
            if (e.target === e.currentTarget) {
              setPreviewImage(null);
            }
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewImage(null)}>×</button>
            <img src={previewImage.url} alt={previewImage.name} />
            <div className="modal-info">
              <h3>{previewImage.name}</h3>
              <p>Size: {formatFileSize(previewImage.size)}</p>
              <p>URL: <code>{previewImage.url}</code></p>
              <button onClick={() => copyImageUrl(previewImage.url)} className="btn btn-primary">
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImages;

