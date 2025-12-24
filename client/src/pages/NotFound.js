import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useSEO from '../hooks/useSEO';
import { getCanonicalUrl } from '../utils/seo';
import './NotFound.scss';

const NotFound = () => {
  const { seo } = useSEO();
  
  // Get SEO data with fallbacks
  const title = seo?.title || '404 - Page Not Found | CrackBuster';
  const description = seo?.description || 'Oops! The page you\'re looking for has a crack in it. Let us help you find what you need.';
  const robots = seo?.robots || 'noindex, nofollow';
  const canonical = seo?.canonicalUrl || getCanonicalUrl('/404');

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={robots} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="not-found">
        <div className="container">
          <div className="not-found-content">
            <div className="error-code">
              <span className="number">4</span>
              <span className="crack-icon">🔧</span>
              <span className="number">4</span>
            </div>

            <h1>Oops! This Page Has a Crack</h1>

            <p className="main-message">
              Looks like this page has a structural issue. Don't worry though -
              we're experts at fixing cracks! Unfortunately, this one is beyond repair.
            </p>

            <div className="humor-section">
              <p className="humor-text">
                The page you're looking for seems to have wandered off.
                Maybe it's getting an estimate somewhere else? 😄
              </p>
            </div>

            <div className="suggestions">
              <h2>Let's Get You Back on Track</h2>
              <div className="suggestion-links">
                <Link to="/" className="suggestion-link">
                  <span className="link-icon">🏠</span>
                  <span>Go Home</span>
                </Link>
                <Link to="/get-estimate" className="suggestion-link">
                  <span className="link-icon">📋</span>
                  <span>Get Estimate</span>
                </Link>
                <Link to="/contact-us" className="suggestion-link">
                  <span className="link-icon">📞</span>
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>

            <div className="fun-fact">
              <p>
                <strong>Fun Fact:</strong> While we can't fix this 404 error,
                we can definitely fix foundation cracks!
                <Link to="/get-estimate"> Get your free estimate today</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;




