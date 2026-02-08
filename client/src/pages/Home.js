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

  const initialServices = serverData?.services || [];
  const isServer = typeof window === 'undefined';
  const [services, setServices] = useState(initialServices);
  const [loading, setLoading] = useState(!initialServices.length && !isServer);

  useEffect(() => {
    if (initialServices.length > 0) {
      setLoading(false);
      return;
    }
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        if (data.services && data.services.length > 0) {
          const featuredServices = data.services.filter(s => s.featured).slice(0, 3);
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CrackBuster",
    "description": "Foundation crack repair, structural stabilization, and concrete leak solutions in Edmonton and surrounding areas. 17+ years, no-digging technology, lifetime transferable warranty.",
    "url": getCanonicalUrl('/'),
    "logo": getCanonicalUrl('/images/logo.png'),
    "image": getDefaultOgImage(),
    "telephone": settings?.phone || "",
    "email": settings?.email || "",
    "address": { "@type": "PostalAddress", "addressLocality": "Edmonton", "addressRegion": "AB", "addressCountry": "CA", "streetAddress": settings?.address || "" },
    "areaServed": [{ "@type": "City", "name": "Edmonton" }, { "@type": "City", "name": "Sherwood Park" }, { "@type": "City", "name": "St. Albert" }],
    "serviceType": "Foundation Crack Repair",
    "priceRange": "$$",
    "openingHours": settings?.businessHours || "Mo-Fr 08:00-17:00"
  };

  const title = seo?.title || 'Foundation Crack Repair in Edmonton | CrackBuster';
  const description = seo?.description || 'Foundation crack repair, structural stabilization, and concrete leak solutions in Edmonton and surrounding areas. 17+ years experience, no-digging technology, lifetime transferable warranty. Free expert assessment.';
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
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={twitterTitle} />
        <meta name="twitter:description" content={twitterDescription} />
        <meta name="twitter:image" content={twitterImage} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="home">
        {/* Hero with background image + parallax */}
        <section
          className="home-hero"
          style={{ backgroundImage: 'url(/images/home/home-hero-edmonton-foundation.jpg)' }}
          aria-label="Foundation crack repair - Edmonton and surrounding areas"
        >
          <div className="home-hero-overlay" />
          <div className="container home-hero-content">
            <h1>Foundation Crack Repair</h1>
            <p className="home-hero-subtitle">Edmonton & Surrounding Areas</p>
            <p className="home-hero-highlight">17 years serving Edmonton and the surrounding area</p>
            <ul className="home-hero-features">
              <li>Transparent & Competitive pricing</li>
              <li>No-Digging Technology</li>
              <li>Lifetime Transferrable Warranty</li>
              <li>Free Expert Assessment</li>
              <li>Advanced Crack Injection System</li>
            </ul>
            {settings && (settings.phone || settings.secondaryPhone) && (
              <div className="home-hero-phone">
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
            <div className="home-hero-buttons">
              <Link to="/get-estimate" className="btn btn-primary btn-large">Get Free Estimate</Link>
              <Link to="/contact-us" className="btn btn-secondary btn-large">Contact Us</Link>
            </div>
          </div>
        </section>

        {/* Intro + Why Choose Us link */}
        <section className="home-intro">
          <div className="container">
            <div className="home-intro-content">
              <div className="intro-text">
                <h2>Expert Foundation & Concrete Solutions</h2>
                <p>
                  Cracks in your foundation can lead to water intrusion, structural concerns, and long-term damage if left unaddressed.
                  At <strong>CrackBuster™</strong>, we specialize in foundation crack repair, structural stabilization solutions,
                  concrete cracks, and concrete leak solutions for residential and commercial properties throughout Edmonton and surrounding communities.
                </p>
                <p>
                  Our repairs are completed from the inside of your home, eliminating the need for excavation while ensuring the exterior
                  side of the foundation is fully sealed and stabilized. We use commercial-grade repair systems designed for long-term
                  performance, not temporary fixes.
                </p>
                <p>
                  We provide a professional approach and exceptional quality service that meets your budget and scheduling.
                </p>
                <Link to="/about-us" className="btn btn-outline">Why Choose Us →</Link>
              </div>
              <div className="intro-image">
                <img
                  src="/images/home/home-intro-basement-result.jpg"
                  alt="Dry finished basement after professional foundation repair - quality result"
                  loading="lazy"
                  width={560}
                  height={380}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Homeowners Choose CrackBuster - full content from docx */}
        <section className="home-why-crackbuster">
          <div className="container">
            <h2>Why Homeowners Choose CrackBuster™</h2>

            <div className="why-crackbuster-row why-crackbuster-row-1">
              <div className="why-crackbuster-image">
                <img src="/images/home/home-why-choose-estimate.jpg" alt="Free honest estimate - professional consultation" loading="lazy" width={520} height={360} />
              </div>
              <div className="why-crackbuster-reasons">
                <div className="why-reason">
                  <span className="why-reason-num">1.</span>
                  <h3>17+ Years of Proven Experience</h3>
                  <p>With over 17 years of hands-on experience, CrackBuster is a locally owned, family-operated foundation crack repair company serving Edmonton and surrounding areas. Our long-standing presence reflects consistent results, proven repair methods, and a reputation built on trust.</p>
                </div>
                <div className="why-reason">
                  <span className="why-reason-num">2.</span>
                  <h3>130+ 5-Star Google Reviews</h3>
                  <p>Our clients consistently rate us 5 stars for professionalism, quality, and lasting results. With over 130 glowing reviews, CrackBuster has earned a reputation in Edmonton and surrounding areas for reliable, expert foundation repair and exceptional customer service.</p>
                </div>
                <div className="why-reason">
                  <span className="why-reason-num">3.</span>
                  <h3>No-Digging Repair Technology</h3>
                  <p>Our repairs are completed from inside the home, eliminating the need for disruptive exterior excavation. This interior-to-exterior repair approach allows us to effectively seal and stabilize foundation cracks while protecting landscaping, concrete, and finished surfaces.</p>
                </div>
                <div className="why-reason">
                  <span className="why-reason-num">4.</span>
                  <h3>Lifetime Transferable Warranty</h3>
                  <p>All qualifying repairs are backed by a lifetime transferable warranty. This means your repair remains protected for as long as you own the home — and the warranty transfers to future homeowners, adding real long-term value and peace of mind.</p>
                </div>
              </div>
            </div>

            <div className="why-crackbuster-row why-crackbuster-row-2">
              <div className="why-crackbuster-reasons">
                <div className="why-reason">
                  <span className="why-reason-num">5.</span>
                  <h3>Commercial-Grade Repair Materials</h3>
                  <p>We use commercial-grade repair materials and professional systems designed specifically for concrete foundations. These materials are selected for long-term performance in Alberta's soil conditions and freeze-thaw climate — not temporary or retail-grade solutions.</p>
                </div>
                <div className="why-reason">
                  <span className="why-reason-num">6.</span>
                  <h3>Free, Honest Estimates</h3>
                  <p>We offer free, no-obligation estimates with clear, easy-to-understand explanations and straightforward recommendations. Our goal is to help homeowners fully understand the issue, repair options, and long-term solutions, with no pressure or unnecessary upselling. We also provide remote estimates for busy homeowners who prefer not to schedule an in-person visit.</p>
                </div>
                <div className="why-reason">
                  <span className="why-reason-num">7.</span>
                  <h3>Transparent & Competitive Pricing</h3>
                  <p>We offer fair, upfront pricing with no hidden fees or surprises. Our goal is to provide high-quality, long-lasting foundation repairs at competitive rates, so you know exactly what you're paying for and can make an informed decision with confidence.</p>
                </div>
                <div className="why-reason">
                  <span className="why-reason-num">8.</span>
                  <h3>Local Edmonton-Based Service</h3>
                  <p>As a local Edmonton company, we understand the foundation challenges common to homes in this region. From soil movement to seasonal moisture changes, our repairs are tailored to conditions found throughout Edmonton and surrounding communities.</p>
                </div>
              </div>
              <div className="why-crackbuster-image">
                <img src="/images/home/home-why-choose-no-dig.jpg" alt="No-digging repair from inside - interior-to-exterior seal" loading="lazy" width={520} height={360} />
              </div>
            </div>

            <p className="why-crackbuster-cta">
              <Link to="/about-us">Learn more about us →</Link>
            </p>
          </div>
        </section>

        {/* Services Preview */}
        <section className="home-services-preview">
          <div className="container">
            <h2>Our Services</h2>
            {loading ? (
              <div className="loading">Loading services...</div>
            ) : services.length > 0 ? (
              <div className="services-grid">
                {services.map(service => (
                  <div key={service._id || service.id} className="service-card">
                    {service.image && (
                      <div className="service-image">
                        <img src={service.image} alt={service.title} loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                    <h3>{service.title}</h3>
                    <div className="service-description" dangerouslySetInnerHTML={{ __html: service.description }} />
                    <Link to={`/services/${service.slug}`} className="service-link">Learn More →</Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-services">No services available at the moment.</p>
            )}
          </div>
        </section>

        <GoogleReviews />

        {/* CTA Section - from docx */}
        <section className="home-cta">
          <div className="container">
            <h2>Don't Let Foundation Cracks Compromise Your Home</h2>
            <p>Contact us today for a free estimate and expert consultation.</p>
            <p className="home-cta-sub">Protect your investment today.</p>
            <Link to="/get-estimate" className="btn btn-primary btn-large">Get Free Estimate</Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
