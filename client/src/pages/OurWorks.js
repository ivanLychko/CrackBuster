import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Lightbox from '../components/Lightbox';
import useSEO from '../hooks/useSEO';
import { useServerData } from '../contexts/ServerDataContext';
import { getCanonicalUrl, getDefaultOgImage } from '../utils/seo';
import './OurWorks.scss';

const OurWorks = () => {
  const { seo } = useSEO();
  const serverData = useServerData();
  const isServer = typeof window === 'undefined';
  
  // Initialize with SSR data if available
  const initialWorks = serverData?.works || [];
  const [works, setWorks] = useState(initialWorks);
  const [loading, setLoading] = useState(!initialWorks.length && !isServer);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    // If we already have works from SSR, skip fetching
    if (initialWorks.length > 0) {
      setLoading(false);
      return;
    }

    const fetchWorks = async () => {
      try {
        const response = await fetch('/api/works');
        const data = await response.json();
        if (data.works && data.works.length > 0) {
          setWorks(data.works);
        } else {
          // Fallback to static data with images from jobs folder (real paths)
          setWorks([
            {
              _id: 1,
              title: 'Foundation Crack Repair - Residential Project #1',
              description: 'Successfully repaired multiple foundation cracks using advanced injection techniques. Before and after photos show complete restoration.',
              images: ['/images/jobs/Pictures 1/Before.webp', '/images/jobs/Pictures 1/After.webp'],
              location: 'Edmonton, AB',
              completedAt: '2024-01-10'
            },
            {
              _id: 2,
              title: 'Basement Waterproofing - Commercial Building',
              description: 'Comprehensive waterproofing solution for commercial property. All cracks sealed and basement remains dry.',
              images: ['/images/jobs/Pictures 2/Before Pic 1.webp', '/images/jobs/Pictures 2/After Pic 1.webp'],
              location: 'Edmonton, AB',
              completedAt: '2024-02-15'
            },
            {
              _id: 3,
              title: 'Crack Injection - Residential Home',
              description: 'Professional crack injection service completed with high-quality materials. Foundation integrity restored.',
              images: ['/images/jobs/Pictures 3/Before 1.webp', '/images/jobs/Pictures 3/After 1.webp'],
              location: 'Edmonton, AB',
              completedAt: '2024-03-20'
            },
            {
              _id: 4,
              title: 'Foundation Repair - Complete Restoration',
              description: 'Complete foundation repair including crack injection and reinforcement. Project completed on time and within budget.',
              images: ['/images/jobs/Pictures 11/1 Before.webp', '/images/jobs/Pictures 11/1 Mid.webp', '/images/jobs/Pictures 11/1 After.webp'],
              location: 'Edmonton, AB',
              completedAt: '2024-04-05'
            },
            {
              _id: 5,
              title: 'Multiple Crack Repair Project',
              description: 'Addressed multiple foundation cracks in residential property. All cracks successfully sealed and waterproofed.',
              images: ['/images/jobs/Pictures 16/Crack 1 before.webp', '/images/jobs/Pictures 16/Crack 1 after.webp'],
              location: 'Edmonton, AB',
              completedAt: '2024-05-12'
            },
            {
              _id: 6,
              title: 'Foundation Reinforcement Project',
              description: 'Added structural reinforcement to foundation walls. Enhanced stability and long-term durability.',
              images: ['/images/jobs/Pictures 16/Deck Securment Before.webp', '/images/jobs/Pictures 16/Deck Securment After 1.webp'],
              location: 'Edmonton, AB',
              completedAt: '2024-06-18'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching works:', error);
        setWorks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, [initialWorks.length]);

  const openLightbox = (images, startIndex = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  // Get SEO data with fallbacks
  const title = seo?.title || 'Our Work & Gallery - Real Results | CrackBuster Edmonton';
  const description = seo?.description || 'Real results from real professionals. Our gallery shows foundation repair projects tailored to each homeowner — lasting solutions, quality workmanship, and customer satisfaction.';
  const keywords = seo?.keywords || '';
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImage ? (seo.ogImage.startsWith('http') ? seo.ogImage : getCanonicalUrl(seo.ogImage)) : getDefaultOgImage();
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;
  const twitterImage = seo?.twitterImage ? (seo.twitterImage.startsWith('http') ? seo.twitterImage : getCanonicalUrl(seo.twitterImage)) : ogImage;
  const canonical = seo?.canonicalUrl || getCanonicalUrl('/our-works');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Our Work & Gallery - CrackBuster',
    description: description,
    url: canonical,
    publisher: { '@type': 'Organization', name: 'CrackBuster' }
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

      <div className="our-works">
        <section
          className="our-works-hero"
          style={{ backgroundImage: 'url(/images/ourworks/ourworks-hero-gallery.webp)' }}
          aria-label="Our work and gallery - real results"
        >
          <div className="our-works-hero-overlay" />
          <div className="container our-works-hero-content">
            <h1>Our Work & Gallery</h1>
            <p className="our-works-hero-subtitle">Real Results from Real Professionals</p>
          </div>
        </section>

        <section className="our-works-intro">
          <div className="container">
            <p className="our-works-intro-text">
              Our gallery provides a glimpse of the work we do — each project is unique, tailored to the homeowner's needs and the foundation's condition. Every repair demonstrates our commitment to lasting solutions, quality workmanship, and customer satisfaction.
            </p>
          </div>
        </section>

        <section className="works-content">
          <div className="container">
            <h2 className="gallery-heading">Gallery</h2>
            {loading ? (
              <div className="loading">Loading projects...</div>
            ) : works.length === 0 ? (
              <div className="no-works">
                <p>No projects available at the moment.</p>
              </div>
            ) : (
              <div className="works-grid">
                {works.map(work => (
                  <div key={work._id || work.id} className="work-card">
                    {work.images && work.images.length > 0 && (
                      <div className="work-image-gallery">
                        <div
                          className="work-main-image"
                          onClick={() => openLightbox(work.images, 0)}
                        >
                          <img
                            src={work.images[0]}
                            alt={work.title}
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.onerror = null;
                            }}
                          />
                          <div className="image-overlay">
                            <span className="view-gallery">
                              {work.images.length} {work.images.length === 1 ? 'Photo' : 'Photos'}
                            </span>
                          </div>
                        </div>
                        {work.images.length > 1 && (
                          <div className="work-thumbnails">
                            {work.images.slice(1, 4).map((img, idx) => (
                              <div
                                key={idx}
                                className="thumbnail"
                                onClick={() => openLightbox(work.images, idx + 1)}
                              >
                                <img
                                  src={img}
                                  alt={`${work.title} - Image ${idx + 2}`}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.onerror = null;
                                  }}
                                />
                              </div>
                            ))}
                            {work.images.length > 4 && (
                              <div
                                className="thumbnail more-photos"
                                onClick={() => openLightbox(work.images, 0)}
                              >
                                <span>+{work.images.length - 4}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="work-content">
                      <h3>{work.title}</h3>
                      <p className="work-location">
                        <span className="location-icon">📍</span> {work.location}
                      </p>
                      <div
                        className="work-description"
                        dangerouslySetInnerHTML={{ __html: work.description }}
                      />
                      <time className="work-date">
                        Completed: {new Date(work.completedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="our-works-cta">
          <div className="container">
            <h2>Protect Your Home Today</h2>
            <p>Request a free, no-obligation estimate today and let our experts provide a professional assessment and honest recommendations.</p>
            <Link to="/get-estimate" className="btn btn-primary btn-large">Get Free Estimate</Link>
          </div>
        </section>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </>
  );
};

export default OurWorks;
