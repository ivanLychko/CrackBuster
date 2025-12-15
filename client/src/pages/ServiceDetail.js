import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FAQ from '../components/FAQ';
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

    return (
        <>
            <Helmet>
                <title>{service.metaTitle || service.title}</title>
                <meta name="description" content={service.metaDescription || service.description} />
                <link rel="canonical" href={`https://crackbuster.ca/services/${slug}`} />
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

