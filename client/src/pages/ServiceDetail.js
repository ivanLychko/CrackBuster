import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FAQ from '../components/FAQ';
import { getCanonicalUrl, getDefaultOgImage } from '../utils/seo';
import './ServiceDetail.scss';

const ServiceDetail = () => {
    const { slug } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await fetch(`/api/services/${slug}`);
                const data = await response.json();
                if (data.service) {
                    setService(data.service);
                } else {
                    setService(null);
                }
            } catch (error) {
                console.error('Error fetching service:', error);
                setService(null);
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [slug]);

    // Add lazy loading to all images in service content
    useEffect(() => {
        if (service) {
            const contentWrapper = document.querySelector('.content-text');
            if (contentWrapper) {
                const images = contentWrapper.querySelectorAll('img');
                images.forEach(img => {
                    if (!img.hasAttribute('loading')) {
                        img.setAttribute('loading', 'lazy');
                    }
                });
            }
        }
    }, [service]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!service) {
        return <div className="error">Service not found</div>;
    }

    // Prepare structured data
    const serviceImage = service.image ? getCanonicalUrl(service.image) : getDefaultOgImage();
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.title,
        "description": service.metaDescription || service.description,
        "provider": {
            "@type": "LocalBusiness",
            "name": "CrackBuster"
        },
        "areaServed": {
            "@type": "City",
            "name": "Edmonton"
        },
        "serviceType": service.title
    };

    return (
        <>
            <Helmet>
                <title>{service.metaTitle || service.title} | CrackBuster</title>
                <meta name="description" content={service.metaDescription || service.description} />
                <link rel="canonical" href={getCanonicalUrl(`/services/${slug}`)} />

                {/* Open Graph */}
                <meta property="og:title" content={`${service.metaTitle || service.title} | CrackBuster`} />
                <meta property="og:description" content={service.metaDescription || service.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={getCanonicalUrl(`/services/${slug}`)} />
                <meta property="og:image" content={serviceImage} />
                <meta property="og:locale" content="en_CA" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${service.metaTitle || service.title} | CrackBuster`} />
                <meta name="twitter:description" content={service.metaDescription || service.description} />
                <meta name="twitter:image" content={serviceImage} />

                {/* JSON-LD Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>

            <div className="service-detail">
                <section className="page-header">
                    <div className="container">
                        <h1>{service.title}</h1>
                    </div>
                </section>

                <section className="service-content">
                    <div className="container">
                        <div className="content-wrapper">
                            <div className="main-content">
                                <p className="description">{service.description}</p>
                                <div
                                    className="content-text"
                                    dangerouslySetInnerHTML={{ __html: service.content }}
                                />
                            </div>
                            <div className="sidebar">
                                <div className="cta-box">
                                    <h3>Need This Service?</h3>
                                    <p>Get a free estimate for your project</p>
                                    <Link to="/get-estimate" className="btn btn-primary">
                                        Get Free Estimate
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                {service.faq && service.faq.length > 0 && (
                    <FAQ items={service.faq} />
                )}
            </div>
        </>
    );
};

export default ServiceDetail;

