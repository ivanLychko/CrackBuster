import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getCanonicalUrl, getDefaultOgImage } from '../utils/seo';
import './Services.scss';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        if (data.services && data.services.length > 0) {
          setServices(data.services);
        } else {
          // Fallback to static data if API returns empty
          setServices([
            {
              _id: 1,
              title: 'Foundation Crack Repair',
              slug: 'foundation-crack-repair',
              description: 'Professional crack injection and repair services to restore your foundation\'s integrity.',
              image: '/data/Stock Images/foundation-crack.jpg'
            },
            {
              _id: 2,
              title: 'Basement Waterproofing',
              slug: 'basement-waterproofing',
              description: 'Comprehensive waterproofing solutions to keep your basement dry and protected.',
              image: '/data/Stock Images/basement-waterproofing.jpg'
            },
            {
              _id: 3,
              title: 'Crack Injection',
              slug: 'crack-injection',
              description: 'Advanced injection techniques for effective and long-lasting crack repairs.',
              image: '/data/Stock Images/crack-injection.jpg'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to static data on error
        setServices([
          {
            _id: 1,
            title: 'Foundation Crack Repair',
            slug: 'foundation-crack-repair',
            description: 'Professional crack injection and repair services to restore your foundation\'s integrity.',
            image: '/data/Stock Images/foundation-crack.jpg'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <>
      <Helmet>
        <title>Foundation Repair Services in Edmonton | CrackBuster</title>
        <meta
          name="description"
          content="Comprehensive foundation repair services in Edmonton. Foundation crack repair, basement waterproofing, crack injection, and more. Expert solutions for your foundation needs."
        />
        <link rel="canonical" href={getCanonicalUrl('/services')} />

        {/* Open Graph */}
        <meta property="og:title" content="Foundation Repair Services in Edmonton | CrackBuster" />
        <meta property="og:description" content="Comprehensive foundation repair services in Edmonton. Foundation crack repair, basement waterproofing, crack injection, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl('/services')} />
        <meta property="og:image" content={getDefaultOgImage()} />
        <meta property="og:locale" content="en_CA" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Foundation Repair Services in Edmonton | CrackBuster" />
        <meta name="twitter:description" content="Comprehensive foundation repair services in Edmonton." />
        <meta name="twitter:image" content={getDefaultOgImage()} />
      </Helmet>

      <div className="services">
        <section className="page-header">
          <div className="container">
            <h1>Our Services</h1>
            <p className="subtitle">Professional Foundation Repair Solutions in Edmonton</p>
          </div>
        </section>

        <section className="services-content">
          <div className="container">
            {loading ? (
              <div className="loading">Loading services...</div>
            ) : (
              <div className="services-grid">
                {services.map(service => (
                  <div key={service._id || service.id} className="service-card">
                    {service.image && (
                      <div className="service-image">
                        <img
                          src={service.image}
                          alt={service.title}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="service-content">
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                      <Link to={`/services/${service.slug}`} className="service-link">
                        Learn More →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Services;

