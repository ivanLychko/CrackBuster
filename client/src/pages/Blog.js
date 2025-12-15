import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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

  return (
    <>
      <Helmet>
        <title>Foundation Repair Blog | CrackBuster Edmonton</title>
        <meta 
          name="description" 
          content="Expert articles about foundation repair, basement waterproofing, and crack repair. Tips and guides from Edmonton's foundation repair experts." 
        />
        <link rel="canonical" href="https://crackbuster.ca/blog" />
      </Helmet>

      <div className="blog">
        <section className="page-header">
          <div className="container">
            <h1>Our Blog</h1>
            <p className="subtitle">Expert Tips and Guides on Foundation Repair</p>
          </div>
        </section>

        <section className="blog-content">
          <div className="container">
            {loading ? (
              <div className="loading">Loading posts...</div>
            ) : (
              <div className="posts-grid">
                {posts.map(post => (
                  <article key={post._id || post.id} className="post-card">
                    {(post.featuredImage || post.image) && (
                      <div className="post-image">
                        <img 
                          src={post.featuredImage || post.image} 
                          alt={post.title}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="post-content">
                      <time className="post-date">{new Date(post.publishedAt).toLocaleDateString()}</time>
                      <h2>
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p className="post-excerpt">{post.excerpt}</p>
                      <Link to={`/blog/${post.slug}`} className="read-more">
                        Read More →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;

