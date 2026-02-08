import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useSEO from '../hooks/useSEO';
import { useServerData } from '../contexts/ServerDataContext';
import { getCanonicalUrl, getDefaultOgImage } from '../utils/seo';
import './Blog.scss';

const Blog = () => {
  const { seo } = useSEO();
  const serverData = useServerData();
  const isServer = typeof window === 'undefined';
  
  // Initialize with SSR data if available
  // Check both serverData and window.__INITIAL_STATE__ for SSR data
  const clientData = typeof window !== 'undefined' && window.__INITIAL_STATE__;
  const initialPosts = serverData?.blogPosts || clientData?.blogPosts || [];
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(!initialPosts.length && !isServer);

  useEffect(() => {
    // If we already have posts from SSR, skip fetching
    if (initialPosts.length > 0) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [initialPosts.length]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Prepare structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "CrackBuster Blog",
    "description": "Expert articles about foundation repair, basement waterproofing, and crack repair",
    "url": getCanonicalUrl('/blog'),
    "publisher": {
      "@type": "LocalBusiness",
      "name": "CrackBuster"
    }
  };

  // Get SEO data with fallbacks
  const title = seo?.title || 'Foundation Repair Blog | CrackBuster Edmonton';
  const description = seo?.description || 'Expert articles about foundation repair, basement waterproofing, and crack repair. Tips and guides from Edmonton\'s foundation repair experts.';
  const keywords = seo?.keywords || '';
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImage ? (seo.ogImage.startsWith('http') ? seo.ogImage : getCanonicalUrl(seo.ogImage)) : getDefaultOgImage();
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;
  const twitterImage = seo?.twitterImage ? (seo.twitterImage.startsWith('http') ? seo.twitterImage : getCanonicalUrl(seo.twitterImage)) : ogImage;
  const canonical = seo?.canonicalUrl || getCanonicalUrl('/blog');

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

      <div className="blog">
        <section
          className="blog-hero"
          style={{ backgroundImage: 'url(/images/blog/hero.webp)' }}
          aria-label="Our Blog"
        >
          <div className="blog-hero-overlay" />
          <div className="container blog-hero-content">
            <h1>Our Blog</h1>
            <p className="subtitle">Expert Tips and Guides on Foundation Repair</p>
            <p className="hero-description">Stay informed with our latest articles on foundation repair, basement waterproofing, and home maintenance. Learn from Edmonton's trusted foundation repair experts.</p>
          </div>
        </section>

        <section className="blog-content">
          <div className="container">
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📰</div>
                <h2>No posts yet</h2>
                <p>Check back soon for expert articles and tips!</p>
              </div>
            ) : (
              <>
                <div className="posts-stats">
                  <span className="stat-item">
                    <span className="stat-icon">📚</span>
                    <span>{posts.length} {posts.length === 1 ? 'Article' : 'Articles'}</span>
                  </span>
                </div>
                <div className="posts-grid">
                  {posts.map(post => (
                    <article key={post._id || post.id} className="post-card">
                      <Link to={`/blog/${post.slug}`} className="post-card-link">
                        {(post.featuredImage || post.image) && (
                          <div className="post-image">
                            <img
                              src={post.featuredImage || post.image}
                              alt={post.title}
                              loading="lazy"
                            />
                            <div className="image-overlay"></div>
                          </div>
                        )}
                        <div className="post-content">
                          <div className="post-meta">
                            <time className="post-date">
                              <span className="date-icon">📅</span>
                              {formatDate(post.publishedAt)}
                            </time>
                          </div>
                          <h2>{post.title}</h2>
                          <div 
                            className="post-excerpt"
                            dangerouslySetInnerHTML={{ __html: post.excerpt }}
                          />
                          <div className="read-more">
                            <span>Read More</span>
                            <span className="arrow-icon">→</span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;

