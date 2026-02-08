import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import useSiteSettings from '../hooks/useSiteSettings';
import useSEO from '../hooks/useSEO';
import { getCanonicalUrl, getDefaultOgImage, SITE_NAME } from '../utils/seo';
import './AboutUs.scss';

const AboutUs = () => {
  const { settings } = useSiteSettings();
  const { seo } = useSEO();

  // Prepare structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About CrackBuster",
    "description": "Locally owned, family-operated foundation crack repair serving Edmonton and surrounding communities for over 17 years",
    "url": getCanonicalUrl('/about-us'),
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "CrackBuster",
      "foundingDate": "2008",
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": "10+"
      }
    }
  };

  // Get SEO data with fallbacks
  const title = seo?.title || 'About Us - Foundation Crack Repair Experts in Edmonton | CrackBuster';
  const description = seo?.description || 'Locally owned, family-operated foundation crack repair serving Edmonton and surrounding communities for over 17 years. Honest assessments, lifetime transferable warranty, no exterior excavation.';
  const keywords = seo?.keywords || '';
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImage ? (seo.ogImage.startsWith('http') ? seo.ogImage : getCanonicalUrl(seo.ogImage)) : getDefaultOgImage();
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;
  const twitterImage = seo?.twitterImage ? (seo.twitterImage.startsWith('http') ? seo.twitterImage : getCanonicalUrl(seo.twitterImage)) : ogImage;
  const canonical = seo?.canonicalUrl || getCanonicalUrl('/about-us');

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

      <div className="about-us">
        <section
          className="about-hero"
          style={{ backgroundImage: 'url(/images/about/about-hero-foundation-repair.webp)' }}
          aria-label="Hero: professional foundation repair"
        >
          <div className="about-hero-overlay" />
          <div className="container about-hero-content">
            <h1>About CrackBuster</h1>
            <p className="subtitle">Foundation Crack Repair & Waterproofing You Can Trust</p>
            <p className="header-highlight">Over 17 Years Serving Edmonton & Surrounding Communities</p>
          </div>
        </section>

        <section className="about-content">
          <div className="container">
            <div className="content-section">
              <h2>Who Are We</h2>
              <p>
                We are a <strong>locally owned and family-operated</strong> foundation crack repair company serving Edmonton
                and surrounding communities for over <strong>17 years</strong>.
              </p>
              <p>
                From the beginning, our focus has been simple: provide long-term, professional repairs using proven methods.
                Our <strong>interior-to-exterior repair approach</strong> allows us to permanently seal and stabilize foundation
                cracks without the need for disruptive exterior excavation.
              </p>
              <p>
                We treat every customer with the same care and respect we would expect for our own homes, because we believe
                <strong> honesty is the foundation of good service</strong>. That means providing straightforward advice—whether
                it involves recommending a simpler, more cost-effective solution or explaining when a repair may not be necessary.
                If a situation falls outside the scope of our services, we will clearly communicate that.
              </p>
            </div>

            <div className="content-section with-image">
              <div className="section-image section-image-right">
                <img
                  src="/images/about/about-team-local-edmonton.webp"
                  alt="CrackBuster team - local Edmonton foundation repair professionals"
                  loading="lazy"
                  width={560}
                  height={380}
                />
              </div>
              <div className="section-text">
                <h2>Our Commitment to You</h2>
                <p>
                  We use commercial-grade repair systems engineered to perform in Alberta's demanding soil conditions and
                  freeze-thaw cycles. Qualifying repairs are backed by a <strong>lifetime transferable warranty</strong>,
                  providing long-term protection and peace of mind.
                </p>
                <p>
                  As a local Edmonton company, we understand the foundation challenges unique to this region and take pride
                  in delivering honest assessments, clear explanations, and solutions that truly serve our customers' best interests.
                </p>
              </div>
            </div>

            <div className="content-section highlight-section">
              <h2>Why Choose CrackBuster</h2>
              <div className="commitment-grid">
                <div className="commitment-item">
                  <div className="commitment-icon">🏆</div>
                  <h3>Lifetime Transferable Warranty</h3>
                  <p>Qualifying repairs are backed by a lifetime transferable warranty. Your investment is protected, and the warranty transfers to new homeowners.</p>
                </div>
                <div className="commitment-item">
                  <div className="commitment-icon">🔧</div>
                  <h3>No Exterior Excavation</h3>
                  <p>Our interior-to-exterior approach permanently seals and stabilizes cracks from the inside—no disruptive digging, less mess, lower cost.</p>
                </div>
                <div className="commitment-item">
                  <div className="commitment-icon">✅</div>
                  <h3>Honest, Straightforward Advice</h3>
                  <p>We recommend what's right for you—including simpler solutions or when a repair may not be necessary. No pressure, just clarity.</p>
                </div>
                <div className="commitment-item">
                  <div className="commitment-icon">📍</div>
                  <h3>Local Edmonton Expertise</h3>
                  <p>17+ years serving this region. We know Alberta's soil, climate, and the foundation issues that matter here.</p>
                </div>
              </div>
            </div>

            <div className="content-section with-image">
              <div className="section-image section-image-left">
                <img
                  src="/images/about/about-warranty-trust.webp"
                  alt="Lifetime warranty and peace of mind for your foundation repair"
                  loading="lazy"
                  width={560}
                  height={380}
                />
              </div>
              <div className="section-text">
                <h2>Don't Wait for Minor Damage to Escalate</h2>
                <p>
                  Small cracks can become costly problems. Let our certified experts evaluate and safeguard your home today.
                  We provide clear assessments and solutions that fit your situation—with no obligation and no pressure.
                </p>
              </div>
            </div>

            <div className="content-section cta-section">
              <h2>Ready to Protect Your Foundation?</h2>
              <p>
                Contact us today for a <strong>FREE ESTIMATE</strong>. Our team will assess your foundation, answer your
                questions, and provide transparent options for any necessary repairs.
              </p>
              <div className="cta-buttons">
                <Link to="/get-estimate" className="btn btn-primary btn-large">
                  Get Free Estimate
                </Link>
                <Link to="/contact-us" className="btn btn-secondary btn-large">
                  Contact Us
                </Link>
              </div>
            </div>

            {settings && (
              <div className="content-section contact-info-section">
                <h2>Get In Touch</h2>
                <div className="contact-details">
                  {settings.phone && (
                    <div className="contact-detail">
                      <strong>Phone:</strong>{' '}
                      <a href={`tel:${settings.phone.replace(/\D/g, '')}`}>{settings.phone}</a>
                      {settings.secondaryPhone && (
                        <> | <a href={`tel:${settings.secondaryPhone.replace(/\D/g, '')}`}>{settings.secondaryPhone}</a></>
                      )}
                    </div>
                  )}
                  {settings.email && (
                    <div className="contact-detail">
                      <strong>Email:</strong>{' '}
                      <a href={`mailto:${settings.email}`}>{settings.email}</a>
                    </div>
                  )}
                  {settings.address && (
                    <div className="contact-detail">
                      <strong>Address:</strong> {settings.address}
                    </div>
                  )}
                  {settings.businessHours && (
                    <div className="contact-detail">
                      <strong>Business Hours:</strong> {settings.businessHours}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;
