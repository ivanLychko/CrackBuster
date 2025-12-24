import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.scss';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [services, setServices] = useState([]);
    const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/services');
                const data = await response.json();
                if (data.services && data.services.length > 0) {
                    setServices(data.services);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        fetchServices();
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleServicesMenu = () => {
        setServicesMenuOpen(!servicesMenuOpen);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const isServiceActive = () => {
        return location.pathname.startsWith('/services/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <img src="/images/logo.png" alt="CrackBuster Logo" />
                    </Link>

                    <button
                        className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
                        <Link to="/" className={isActive('/')} onClick={() => setIsMenuOpen(false)}>
                            Home
                        </Link>
                        <Link to="/about-us" className={isActive('/about-us')} onClick={() => setIsMenuOpen(false)}>
                            About Us
                        </Link>
                        <div
                            className={`nav-item-with-submenu ${isServiceActive() ? 'active' : ''} ${servicesMenuOpen ? 'open' : ''}`}
                            onMouseEnter={() => {
                                if (window.innerWidth > 768) {
                                    setServicesMenuOpen(true);
                                }
                            }}
                            onMouseLeave={() => {
                                if (window.innerWidth > 768) {
                                    setServicesMenuOpen(false);
                                }
                            }}
                        >
                            <span
                                className="nav-link"
                                onClick={(e) => {
                                    if (window.innerWidth <= 768) {
                                        e.preventDefault();
                                        toggleServicesMenu();
                                    }
                                }}
                            >
                                Services
                            </span>
                            {services.length > 0 && (
                                <ul className="submenu">
                                    {services.map(service => (
                                        <li key={service._id || service.id}>
                                            <Link
                                                to={`/services/${service.slug}`}
                                                className={location.pathname === `/services/${service.slug}` ? 'active' : ''}
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setServicesMenuOpen(false);
                                                }}
                                            >
                                                {service.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Link to="/blog" className={isActive('/blog')} onClick={() => setIsMenuOpen(false)}>
                            Blog
                        </Link>
                        <Link to="/our-works" className={isActive('/our-works')} onClick={() => setIsMenuOpen(false)}>
                            Our Works
                        </Link>
                        <Link to="/get-estimate" className={`cta-button ${isActive('/get-estimate')}`} onClick={() => setIsMenuOpen(false)}>
                            Get Estimate
                        </Link>
                        <Link to="/contact-us" className={isActive('/contact-us')} onClick={() => setIsMenuOpen(false)}>
                            Contact Us
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;

