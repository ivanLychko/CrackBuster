import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import useSEO from '../hooks/useSEO';
import { useToast } from '../contexts/ToastContext';
import { getCanonicalUrl, getDefaultOgImage } from '../utils/seo';
import './GetEstimate.scss';

const GetEstimate = () => {
  const { seo } = useSEO();
  const { showError, showWarning } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];

    files.forEach((file, index) => {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only images are allowed.`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setImageErrors(errors);
      showWarning('Some files were not added:\n' + errors.join('\n'));
    } else {
      setImageErrors([]);
    }

    if (validFiles.length > 0) {
      // Create preview URLs for valid files
      const newImages = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name
      }));
      setSelectedImages(prev => [...prev, ...newImages]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    const imageToRemove = selectedImages[index];
    URL.revokeObjectURL(imageToRemove.preview);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.description) {
      showError('Please fill in all required fields.');
      return;
    }

    // Validate that at least one image is selected
    if (selectedImages.length === 0) {
      showError('Please upload at least one image for your estimate request.');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('description', formData.description.trim());

      // Append images
      selectedImages.forEach((imageObj) => {
        if (imageObj && imageObj.file) {
          formDataToSend.append('images', imageObj.file);
        }
      });

      // Debug: Log form data (without files)
      console.log('Submitting form with:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        imagesCount: selectedImages.length
      });

      const response = await fetch('/api/estimate', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        // Clean up preview URLs
        selectedImages.forEach(imageObj => {
          URL.revokeObjectURL(imageObj.preview);
        });

        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          description: ''
        });
        setSelectedImages([]);
        setImageErrors([]);
      } else {
        let errorMessage = 'Failed to submit request';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        showError('Error: ' + errorMessage);
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showError('There was an error submitting your request. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  // Get SEO data with fallbacks
  const title = seo?.title || 'Get Free Estimate - Foundation Repair | CrackBuster Edmonton';
  const description = seo?.description || 'Get a free estimate for your foundation repair project in Edmonton. Fill out our form and we\'ll get back to you with a detailed quote.';
  const keywords = seo?.keywords || '';
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImage ? (seo.ogImage.startsWith('http') ? seo.ogImage : getCanonicalUrl(seo.ogImage)) : getDefaultOgImage();
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;
  const twitterImage = seo?.twitterImage ? (seo.twitterImage.startsWith('http') ? seo.twitterImage : getCanonicalUrl(seo.twitterImage)) : ogImage;
  const canonical = seo?.canonicalUrl || getCanonicalUrl('/get-estimate');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: canonical,
    mainEntity: {
      '@type': 'ContactPage',
      name: 'Get Free Estimate - CrackBuster',
      description: 'Request a free estimate for foundation repair in Edmonton.'
    }
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <link rel="canonical" href={canonical} />

        {/* Open Graph */}
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_CA" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={twitterTitle} />
        <meta name="twitter:description" content={twitterDescription} />
        <meta name="twitter:image" content={twitterImage} />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="get-estimate">
        <section
          className="get-estimate-hero"
          style={{ backgroundImage: 'url(/images/get-estimate/hero.webp)' }}
          aria-label="Get your free estimate"
        >
          <div className="get-estimate-hero-overlay" />
          <div className="container get-estimate-hero-content">
            <h1>Get Your Free Estimate</h1>
            <p className="subtitle">Fill out the form below and we'll get back to you soon</p>
          </div>
        </section>

        <section className="estimate-form-section">
          <div className="container">
            {submitted ? (
              <div className="success-message">
                <h2>Thank You!</h2>
                <p>We've received your estimate request. Our team will contact you shortly.</p>
              </div>
            ) : (
              <form className="estimate-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Property Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address, Edmonton, AB"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Please describe the foundation issues you're experiencing..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="images">Upload Images *</label>
                  <p className="form-hint">Please upload at least one image (up to 10 images). Each image must be less than 10MB. Supported formats: JPG, PNG, GIF, WebP</p>
                  <input
                    type="file"
                    id="images"
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="file-input"
                  />

                  {selectedImages.length > 0 && (
                    <div className="image-preview-container">
                      <h4>Selected Images ({selectedImages.length}/10):</h4>
                      <div className="image-preview-grid">
                        {selectedImages.map((imageObj, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={imageObj.preview} alt={`Preview ${index + 1}`} />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeImage(index)}
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                            <p className="image-name">{imageObj.name}</p>
                            <p className="image-size">
                              {(imageObj.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {imageErrors.length > 0 && (
                    <div className="image-errors">
                      {imageErrors.map((error, index) => (
                        <p key={index} className="error-message">{error}</p>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-large"
                  disabled={submitting || selectedImages.length === 0}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                {selectedImages.length === 0 && (
                  <p className="form-error">Please upload at least one image to submit your estimate request.</p>
                )}
              </form>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default GetEstimate;

