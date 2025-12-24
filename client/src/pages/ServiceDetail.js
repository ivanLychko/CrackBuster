import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FAQ from '../components/FAQ';
import useSEO from '../hooks/useSEO';
import { useServerData } from '../contexts/ServerDataContext';
import { getCanonicalUrl, getDefaultOgImage } from '../utils/seo';
import './ServiceDetail.scss';

const ServiceDetail = () => {
    const { slug } = useParams();
    const { seo: seoTemplate } = useSEO(); // Get template SEO for service-detail
    const serverData = useServerData();
    const isServer = typeof window === 'undefined';
    
    // Initialize with SSR data if available
    const initialService = serverData?.serviceDetail || null;
    const [service, setService] = useState(initialService);
    const [loading, setLoading] = useState(!initialService && !isServer);

    useEffect(() => {
        // If we already have service from SSR, skip fetching
        if (initialService) {
            setLoading(false);
            return;
        }

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
    }, [slug, initialService]);

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

    // Priority: Individual SEO > Basic Meta > Template SEO > Fallbacks
    const title = service.seoTitle || service.metaTitle || service.title || seoTemplate?.title || `${service.title} | CrackBuster`;
    const description = service.seoDescription || service.metaDescription || service.description || seoTemplate?.description || '';
    const keywords = service.seoKeywords || (service.keywords ? (Array.isArray(service.keywords) ? service.keywords.join(', ') : service.keywords) : '') || seoTemplate?.keywords || '';
    const ogTitle = service.ogTitle || service.seoTitle || service.metaTitle || service.title || seoTemplate?.ogTitle || title;
    const ogDescription = service.ogDescription || service.seoDescription || service.metaDescription || service.description || seoTemplate?.ogDescription || description;
    const ogImage = service.ogImage ? (
      service.ogImage.startsWith('http') ? service.ogImage : getCanonicalUrl(service.ogImage)
    ) : (
      serviceImage || (seoTemplate?.ogImage ? (seoTemplate.ogImage.startsWith('http') ? seoTemplate.ogImage : getCanonicalUrl(seoTemplate.ogImage)) : getDefaultOgImage())
    );
    const twitterTitle = service.twitterTitle || service.ogTitle || service.seoTitle || service.metaTitle || service.title || seoTemplate?.twitterTitle || ogTitle;
    const twitterDescription = service.twitterDescription || service.ogDescription || service.seoDescription || service.metaDescription || service.description || seoTemplate?.twitterDescription || ogDescription;
    const twitterImage = service.twitterImage ? (
      service.twitterImage.startsWith('http') ? service.twitterImage : getCanonicalUrl(service.twitterImage)
    ) : (
      seoTemplate?.twitterImage ? (seoTemplate.twitterImage.startsWith('http') ? seoTemplate.twitterImage : getCanonicalUrl(seoTemplate.twitterImage)) : ogImage
    );
    const canonical = service.canonicalUrl || seoTemplate?.canonicalUrl || getCanonicalUrl(`/services/${slug}`);
    const robots = service.robots || seoTemplate?.robots || '';

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                {keywords && <meta name="keywords" content={keywords} />}
                {robots && <meta name="robots" content={robots} />}
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

