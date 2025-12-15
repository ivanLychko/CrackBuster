import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getCanonicalUrl, getDefaultOgImage } from '../utils/seo';
import './Blog.scss';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts);
        } else {
          // Fallback to static data if API returns empty
          setPosts([
            {
              _id: 1,
              title: 'Why Repair Foundation Cracks',
              slug: 'why-repair-cracks',
              excerpt: 'Understanding the importance of timely foundation crack repair...',
              publishedAt: '2024-01-15',
              featuredImage: '/data/Stock Images/crack-repair.jpg'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

  return (
    <>
      <Helmet>
        <title>Foundation Repair Blog | CrackBuster Edmonton</title>
        <meta
          name="description"
          content="Expert articles about foundation repair, basement waterproofing, and crack repair. Tips and guides from Edmonton's foundation repair experts."
        />
        <link rel="canonical" href={getCanonicalUrl('/blog')} />

        {/* Open Graph */}
        <meta property="og:title" content="Foundation Repair Blog | CrackBuster Edmonton" />
        <meta property="og:description" content="Expert articles about foundation repair, basement waterproofing, and crack repair. Tips and guides from Edmonton's foundation repair experts." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl('/blog')} />
        <meta property="og:image" content={getDefaultOgImage()} />
        <meta property="og:locale" content="en_CA" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Foundation Repair Blog | CrackBuster Edmonton" />
        <meta name="twitter:description" content="Expert articles about foundation repair, basement waterproofing, and crack repair." />
        <meta name="twitter:image" content={getDefaultOgImage()} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="blog">
        <section className="page-header">
          <div className="container">
            <h1>Our Blog</h1>
            <p className="subtitle">Expert Tips and Guides on Foundation Repair</p>
            <div className="header-description">
              <p>Stay informed with our latest articles on foundation repair, basement waterproofing, and home maintenance. Learn from Edmonton's trusted foundation repair experts.</p>
            </div>
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
                          <p className="post-excerpt">{post.excerpt}</p>
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

