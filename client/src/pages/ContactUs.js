import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import useSiteSettings from '../hooks/useSiteSettings';
import useSEO from '../hooks/useSEO';
import { useToast } from '../contexts/ToastContext';
import { getCanonicalUrl, getDefaultOgImage } from '../utils/seo';
import './ContactUs.scss';

const ContactUs = () => {
  const { settings, loading } = useSiteSettings();
  const { seo } = useSEO();
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showError('There was an error submitting your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact CrackBuster",
    "description": "Contact CrackBuster for foundation repair services in Edmonton",
    "url": getCanonicalUrl('/contact-us')
  };

  // Get SEO data with fallbacks
  const title = seo?.title || 'Contact Us - Foundation Repair Experts | CrackBuster Edmonton';
  const description = seo?.description || 'Contact CrackBuster for foundation repair services in Edmonton. Get in touch with our expert team for consultations and inquiries.';
  const keywords = seo?.keywords || '';
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImage ? (seo.ogImage.startsWith('http') ? seo.ogImage : getCanonicalUrl(seo.ogImage)) : getDefaultOgImage();
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;
  const twitterImage = seo?.twitterImage ? (seo.twitterImage.startsWith('http') ? seo.twitterImage : getCanonicalUrl(seo.twitterImage)) : ogImage;
  const canonical = seo?.canonicalUrl || getCanonicalUrl('/contact-us');

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
        <meta property="og:locale" content="en_CA" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={twitterTitle} />
        <meta name="twitter:description" content={twitterDescription} />
        <meta name="twitter:image" content={twitterImage} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="contact-us">
        <section
          className="contact-us-hero"
          style={{ backgroundImage: 'url(/images/contact-us/hero.webp)' }}
          aria-label="Contact us"
        >
          <div className="contact-us-hero-overlay" />
          <div className="container contact-us-hero-content">
            <h1>Contact Us</h1>
            <p className="subtitle">Get in touch with our team</p>
          </div>
        </section>

        <section className="contact-content">
          <div className="container">
            <div className="contact-wrapper">
              <div className="contact-info">
                <h2>Get In Touch</h2>
                {loading ? (
                  <p>Loading contact information...</p>
                ) : settings ? (
                  <>
                    {settings.address && (
                      <div className="info-item">
                        <h3>Location</h3>
                        <p>{settings.address}</p>
                      </div>
                    )}
                    {settings.email && (
                      <div className="info-item">
                        <h3>Email</h3>
                        <p><a href={`mailto:${settings.email}`}>{settings.email}</a></p>
                        {settings.secondaryEmail && (
                          <p><a href={`mailto:${settings.secondaryEmail}`}>{settings.secondaryEmail}</a></p>
                        )}
                      </div>
                    )}
                    {settings.phone && (
                      <div className="info-item">
                        <h3>Phone</h3>
                        <p><a href={`tel:${settings.phone.replace(/\D/g, '')}`}>{settings.phone}</a></p>
                        {settings.secondaryPhone && (
                          <p><a href={`tel:${settings.secondaryPhone.replace(/\D/g, '')}`}>{settings.secondaryPhone}</a></p>
                        )}
                      </div>
                    )}
                    {settings.serviceArea && (
                      <div className="info-item">
                        <h3>Service Area</h3>
                        <p>{settings.serviceArea}</p>
                      </div>
                    )}
                    {settings.businessHours && (
                      <div className="info-item">
                        <h3>Business Hours</h3>
                        <p>{settings.businessHours}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              <div className="contact-form-wrapper">
                {submitted ? (
                  <div className="success-message">
                    <h2>Thank You!</h2>
                    <p>We've received your message. Our team will get back to you soon.</p>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit}>
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
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary btn-large" disabled={submitting}>
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactUs;

