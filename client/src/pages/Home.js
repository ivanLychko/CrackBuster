import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useSiteSettings from '../hooks/useSiteSettings';
import useSEO from '../hooks/useSEO';
import { useServerData } from '../contexts/ServerDataContext';
import { getCanonicalUrl, getDefaultOgImage, SITE_NAME } from '../utils/seo';
import GoogleReviews from '../components/GoogleReviews';
import './Home.scss';

const Home = () => {
  const { settings } = useSiteSettings();
  const { seo } = useSEO();
  const serverData = useServerData();

  // Initialize with SSR data if available
  const initialServices = serverData?.services || [];
  const isServer = typeof window === 'undefined';
  // On server, always render content even if no services yet
  const [services, setServices] = useState(initialServices);
  const [loading, setLoading] = useState(!initialServices.length && !isServer);

  useEffect(() => {
    // If we already have services from SSR, skip fetching
    if (initialServices.length > 0) {
      setLoading(false);
      return;
    }

    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        if (data.services && data.services.length > 0) {
          // Get featured services or first 3
          const featuredServices = data.services
            .filter(s => s.featured)
            .slice(0, 3);
          setServices(featuredServices.length >= 3 ? featuredServices : data.services.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [initialServices.length]);

  // Prepare structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CrackBuster",
    "description": "Professional foundation crack repair services in Edmonton, Canada",
    "url": getCanonicalUrl('/'),
    "logo": getCanonicalUrl('/images/logo.png'),
    "image": getDefaultOgImage(),
    "telephone": settings?.phone || "",
    "email": settings?.email || "",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Edmonton",
      "addressRegion": "AB",
      "addressCountry": "CA",
      "streetAddress": settings?.address || ""
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Edmonton"
      },
      {
        "@type": "City",
        "name": "Sherwood Park"
      },
      {
        "@type": "City",
        "name": "St. Albert"
      }
    ],
    "serviceType": "Foundation Crack Repair",
    "priceRange": "$$",
    "openingHours": settings?.businessHours || "Mo-Fr 08:00-17:00"
  };

  // Get SEO data with fallbacks
  const title = seo?.title || 'Foundation Crack Repair in Edmonton | CrackBuster';
  const description = seo?.description || 'Professional foundation crack repair services in Edmonton, Canada. Expert solutions for basement waterproofing, foundation repair, and crack injection. Free estimates available.';
  const keywords = seo?.keywords || 'foundation crack repair, edmonton, canada, basement waterproofing, foundation repair, crack injection, concrete repair';
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImage ? (seo.ogImage.startsWith('http') ? seo.ogImage : getCanonicalUrl(seo.ogImage)) : getDefaultOgImage();
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;
  const twitterImage = seo?.twitterImage ? (seo.twitterImage.startsWith('http') ? seo.twitterImage : getCanonicalUrl(seo.twitterImage)) : ogImage;
  const canonical = seo?.canonicalUrl || getCanonicalUrl('/');

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
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

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="home">
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h1>Foundation Crack Repair</h1>
              <p className="hero-subtitle">
                Over 12 years of excellence in NO DIGGING crack repair.
                Expert solutions for basement waterproofing, foundation repair, and crack injection.
                Serving Edmonton, Sherwood Park, and St. Albert with quality service you can trust.
              </p>
              <p className="hero-highlight">
                <strong>Crack Injection System</strong> • <strong>Complete Structural Repair</strong> • <strong>Lifetime Guaranteed and Transferable</strong>
              </p>
              {settings && (settings.phone || settings.secondaryPhone) && (
                <div className="hero-phone">
                  {settings.phone && (
                    <a href={`tel:${settings.phone.replace(/\D/g, '')}`} className="phone-link">
                      <span className="phone-icon">📞</span>
                      <span className="phone-number">{settings.phone}</span>
                    </a>
                  )}
                  {settings.secondaryPhone && (
                    <a href={`tel:${settings.secondaryPhone.replace(/\D/g, '')}`} className="phone-link">
                      <span className="phone-icon">📞</span>
                      <span className="phone-number">{settings.secondaryPhone}</span>
                    </a>
                  )}
                </div>
              )}
              <div className="hero-buttons">
                <Link to="/get-estimate" className="btn btn-primary">
                  Get Free Estimate
                </Link>
                <Link to="/contact-us" className="btn btn-secondary">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services Preview */}
        <section className="services-preview">
          <div className="container">
            <h2>Our Services</h2>
            {loading ? (
              <div className="loading">Loading services...</div>
            ) : services.length > 0 ? (
              <>
                <div className="services-grid">
                  {services.map(service => (
                    <div key={service._id || service.id} className="service-card">
                      {service.image && (
                        <div className="service-image">
                          <img
                            src={service.image}
                            alt={service.title}
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <h3>{service.title}</h3>
                      <div 
                        className="service-description"
                        dangerouslySetInnerHTML={{ __html: service.description }}
                      />
                      <Link to={`/services/${service.slug}`} className="service-link">
                        Learn More →
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-services">No services available at the moment.</p>
            )}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="why-choose-us">
          <div className="container">
            <h2>Why Choose CrackBuster?</h2>
            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon">🏆</div>
                <h3>12+ Years Experience</h3>
                <p>Over a decade of proven expertise serving Edmonton, Sherwood Park, and St. Albert areas.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🔧</div>
                <h3>NO DIGGING Technology</h3>
                <p>Our specialized injection system repairs cracks from inside - no disruptive exterior excavation needed.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">✅</div>
                <h3>Lifetime Guarantee</h3>
                <p>All repairs come with a lifetime guarantee that's transferable to new homeowners.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">💎</div>
                <h3>Quality Materials</h3>
                <p>Premium polyurethane and epoxy materials specifically formulated for permanent concrete repair.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">📞</div>
                <h3>Free Estimates</h3>
                <p>Get a free, no-obligation estimate for your foundation repair project.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🏠</div>
                <h3>Local Service</h3>
                <p>Proudly serving Edmonton, Sherwood Park, St. Albert and surrounding areas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Google Reviews Section */}
        <GoogleReviews />

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2>Ready to Fix Your Foundation?</h2>
            <p>Contact us today for a free estimate and expert consultation.</p>
            <Link to="/get-estimate" className="btn btn-primary btn-large">
              Get Your Free Estimate
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;

