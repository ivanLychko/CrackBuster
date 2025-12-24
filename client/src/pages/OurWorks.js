import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Lightbox from '../components/Lightbox';
import useSEO from '../hooks/useSEO';
import { getCanonicalUrl, getDefaultOgImage } from '../utils/seo';
import './OurWorks.scss';

const OurWorks = () => {
  const { seo } = useSEO();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await fetch('/api/works');
        const data = await response.json();
        if (data.works && data.works.length > 0) {
          setWorks(data.works);
        } else {
          // Fallback to static data with images from data folder
          setWorks([
            {
              _id: 1,
              title: 'Foundation Crack Repair - Residential Project #1',
              description: 'Successfully repaired multiple foundation cracks using advanced injection techniques. Before and after photos show complete restoration.',
              images: [
                '/images/jobs/#1 Before.jpg',
                '/images/jobs/#1 Mid.jpg',
                '/images/jobs/#1 After.jpg'
              ],
              location: 'Edmonton, AB',
              completedAt: '2024-01-10'
            },
            {
              _id: 2,
              title: 'Basement Waterproofing - Commercial Building',
              description: 'Comprehensive waterproofing solution for commercial property. All cracks sealed and basement remains dry.',
              images: [
                '/images/jobs/#2 Before.jpg',
                '/images/jobs/#2 After.jpg',
                '/images/jobs/#2-1 Before.jpg',
                '/images/jobs/#2-1 After.jpg'
              ],
              location: 'Edmonton, AB',
              completedAt: '2024-02-15'
            },
            {
              _id: 3,
              title: 'Crack Injection - Residential Home',
              description: 'Professional crack injection service completed with high-quality materials. Foundation integrity restored.',
              images: [
                '/images/jobs/#3 Before.jpg',
                '/images/jobs/#3 After.jpg',
                '/images/jobs/Pic 1 Before.jpg',
                '/images/jobs/Pic 1 After.jpg'
              ],
              location: 'Edmonton, AB',
              completedAt: '2024-03-20'
            },
            {
              _id: 4,
              title: 'Foundation Repair - Complete Restoration',
              description: 'Complete foundation repair including crack injection and reinforcement. Project completed on time and within budget.',
              images: [
                '/images/jobs/#10 Before.jpg',
                '/images/jobs/#10 After.jpg',
                '/images/jobs/#11 Before.jpg',
                '/images/jobs/#11 After.jpg',
                '/images/jobs/#12 Before.jpg',
                '/images/jobs/#12 After.jpg'
              ],
              location: 'Edmonton, AB',
              completedAt: '2024-04-05'
            },
            {
              _id: 5,
              title: 'Multiple Crack Repair Project',
              description: 'Addressed multiple foundation cracks in residential property. All cracks successfully sealed and waterproofed.',
              images: [
                '/images/jobs/#13 Before.jpg',
                '/images/jobs/#13 After.jpg',
                '/images/jobs/Crack #1 before.jpg',
                '/images/jobs/Crack #1 after.jpg'
              ],
              location: 'Edmonton, AB',
              completedAt: '2024-05-12'
            },
            {
              _id: 6,
              title: 'Foundation Reinforcement Project',
              description: 'Added structural reinforcement to foundation walls. Enhanced stability and long-term durability.',
              images: [
                '/images/jobs/Reinforcment 1.jpg',
                '/images/jobs/Reinforcment 2.jpeg',
                '/images/jobs/Reinforcment 3.jpeg',
                '/images/jobs/Reinforcment 4.jpg'
              ],
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
  }, []);

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
  const title = seo?.title || 'Our Works - Foundation Repair Projects | CrackBuster Edmonton';
  const description = seo?.description || 'View our completed foundation repair projects in Edmonton. See examples of our quality workmanship and successful foundation repair solutions.';
  const keywords = seo?.keywords || '';
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImage ? (seo.ogImage.startsWith('http') ? seo.ogImage : getCanonicalUrl(seo.ogImage)) : getDefaultOgImage();
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;
  const twitterImage = seo?.twitterImage ? (seo.twitterImage.startsWith('http') ? seo.twitterImage : getCanonicalUrl(seo.twitterImage)) : ogImage;
  const canonical = seo?.canonicalUrl || getCanonicalUrl('/our-works');

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
      </Helmet>

      <div className="our-works">
        <section className="page-header">
          <div className="container">
            <h1>Our Works</h1>
            <p className="subtitle">Recent Foundation Repair Projects in Edmonton</p>
          </div>
        </section>

        <section className="works-content">
          <div className="container">
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
                              // Try alternative formats
                              const src = e.target.src;
                              if (src && !src.endsWith('.webp')) {
                                const webpSrc = src.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
                                e.target.src = webpSrc;
                                return;
                              }
                              // If still fails, show placeholder
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
                                    // Try alternative formats
                                    const src = e.target.src;
                                    if (src && !src.endsWith('.webp')) {
                                      const webpSrc = src.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
                                      e.target.src = webpSrc;
                                      return;
                                    }
                                    // If still fails, hide image
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
