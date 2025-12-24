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
    "description": "Learn about CrackBuster - over 12 years of experience in foundation crack repair",
    "url": getCanonicalUrl('/about-us'),
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "CrackBuster",
      "foundingDate": "2012",
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": "10+"
      }
    }
  };

  // Get SEO data with fallbacks
  const title = seo?.title || 'About Us - Foundation Crack Repair Experts in Edmonton | CrackBuster';
  const description = seo?.description || 'Learn about CrackBuster - over 12 years of experience in foundation crack repair. Serving Edmonton, Sherwood Park, and St. Albert with NO DIGGING crack repair technology and lifetime guarantee.';
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
        <section className="page-header">
          <div className="container">
            <h1>About CrackBuster</h1>
            <p className="subtitle">Foundation Crack Repair & Waterproofing System You Can Trust</p>
            <p className="header-highlight">Over 12 Years of Excellence in Foundation Repair</p>
          </div>
        </section>

        <section className="about-content">
          <div className="container">
            <div className="content-section">
              <h2>Who We Are</h2>
              <p>
                For over <strong>12 years</strong>, CrackBuster has been the trusted leader in foundation crack repair,
                serving Edmonton, Sherwood Park, and St. Albert areas with quality <strong>NO DIGGING</strong> crack repair solutions.
                We specialize in providing permanent, reliable foundation repair that protects your property for years to come.
              </p>
              <p>
                Our team of certified technicians is dedicated to helping homeowners and businesses protect their properties
                from foundation damage without the mess and disruption of traditional digging methods. We understand that foundation
                issues can be stressful and costly, which is why we're committed to providing transparent communication,
                quality workmanship, and exceptional customer service.
              </p>
              <p>
                What sets us apart is our specialized <strong>Crack Injection System</strong> - a revolutionary approach that
                repairs foundation cracks from the inside, eliminating the need for expensive and disruptive exterior excavation.
                This method is not only more efficient but also provides a permanent solution that stands the test of time.
              </p>
            </div>

            <div className="content-section highlight-section">
              <h2>Our Commitment to Excellence</h2>
              <div className="commitment-grid">
                <div className="commitment-item">
                  <div className="commitment-icon">🏆</div>
                  <h3>Lifetime Guarantee</h3>
                  <p>We offer a <strong>Life Time Guaranteed and Transferable</strong> warranty on all our repairs. This means your investment is protected, and the warranty even transfers to new homeowners, adding value to your property.</p>
                </div>
                <div className="commitment-item">
                  <div className="commitment-icon">🔧</div>
                  <h3>NO DIGGING Technology</h3>
                  <p>Our specialized injection system repairs cracks from the inside, eliminating the need for disruptive exterior digging. This means faster repairs, less mess, and lower costs for you.</p>
                </div>
                <div className="commitment-item">
                  <div className="commitment-icon">✅</div>
                  <h3>Complete Structural Repair</h3>
                  <p>We don't just patch cracks - we provide complete structural repair using expanding polyurethane that fills the full width and length of the crack, ensuring a permanent solution.</p>
                </div>
                <div className="commitment-item">
                  <div className="commitment-icon">📞</div>
                  <h3>Quick Response</h3>
                  <p>With our local presence in the Edmonton area, we can respond quickly to your needs. We understand that foundation problems need immediate attention, and we're here to help.</p>
                </div>
              </div>
            </div>

            <div className="content-section">
              <h2>Our Mission</h2>
              <p>
                Our mission is to provide the highest quality foundation repair services while maintaining the highest standards
                of professionalism and customer satisfaction. We believe in building lasting relationships with our clients through
                trust, integrity, and superior workmanship.
              </p>
              <p>
                We are committed to protecting your most valuable investment - your home or business. Every repair we perform
                is backed by our lifetime guarantee, ensuring that you can have complete confidence in our work.
              </p>
            </div>

            <div className="content-section">
              <h2>Our Expertise & Technology</h2>
              <div className="expertise-content">
                <div className="expertise-item">
                  <h3>Polyurethane Injection</h3>
                  <p>
                    Our polyurethane injection system is especially formulated for concrete repair. The material expands upon
                    contact to fill the entire crack, creating a flexible seal that moves with your foundation. This permanent
                    repair method prevents water leaks and structural damage, and because it's done from the inside, no exterior
                    digging is required.
                  </p>
                </div>
                <div className="expertise-item">
                  <h3>Epoxy Injection</h3>
                  <p>
                    For structural repairs where the concrete is dry, we offer epoxy injection services. This method provides
                    exceptional strength and is recommended for structural reinforcement purposes.
                  </p>
                </div>
                <div className="expertise-item">
                  <h3>Foundation Inspections</h3>
                  <p>
                    We also provide comprehensive foundation inspections to identify potential issues before they become major
                    problems. Early detection can save you thousands of dollars in repair costs.
                  </p>
                </div>
              </div>
            </div>

            <div className="content-section">
              <h2>Why Choose CrackBuster</h2>
              <div className="features-list">
                <div className="feature-item">
                  <h3>12+ Years Experience</h3>
                  <p>Over a decade of proven expertise in foundation crack repair and waterproofing services throughout the Edmonton area.</p>
                </div>
                <div className="feature-item">
                  <h3>Lifetime Guarantee</h3>
                  <p>All our repairs come with a lifetime guarantee that's transferable to new homeowners, protecting your investment.</p>
                </div>
                <div className="feature-item">
                  <h3>NO DIGGING Method</h3>
                  <p>Our specialized injection system repairs cracks from inside, eliminating expensive and disruptive exterior excavation.</p>
                </div>
                <div className="feature-item">
                  <h3>Quality Materials</h3>
                  <p>We use only premium polyurethane and epoxy materials specifically formulated for permanent concrete repair.</p>
                </div>
                <div className="feature-item">
                  <h3>Local Knowledge</h3>
                  <p>Deep understanding of Edmonton's climate, soil conditions, and common foundation issues in the region.</p>
                </div>
                <div className="feature-item">
                  <h3>Customer Focused</h3>
                  <p>Your satisfaction is our top priority. We work closely with you every step of the way, from inspection to completion.</p>
                </div>
              </div>
            </div>

            <div className="content-section">
              <h2>Our Service Area</h2>
              <p>
                We proudly serve the following areas in Alberta:
              </p>
              <div className="service-areas">
                <div className="area-item">
                  <strong>Edmonton</strong> - Our primary service area, covering all neighborhoods and districts
                </div>
                <div className="area-item">
                  <strong>Sherwood Park</strong> - Full service coverage for residential and commercial properties
                </div>
                <div className="area-item">
                  <strong>St. Albert</strong> - Expert foundation repair services for the community
                </div>
                <div className="area-item">
                  <strong>Surrounding Areas</strong> - We also service surrounding communities in the greater Edmonton region
                </div>
              </div>
              <p>
                Our local presence allows us to respond quickly to your needs and provide personalized service to our community.
                We understand the unique challenges that Alberta's climate and soil conditions present, and we have the expertise
                to address them effectively.
              </p>
            </div>

            <div className="content-section cta-section">
              <h2>Ready to Protect Your Foundation?</h2>
              <p>
                Don't wait until a small crack becomes a major problem. Contact us today for a <strong>FREE ESTIMATE</strong>
                and let our experts assess your foundation. We'll provide you with a detailed evaluation and a transparent quote
                for any necessary repairs.
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

