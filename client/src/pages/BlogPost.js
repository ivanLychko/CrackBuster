import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './BlogPost.scss';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/${slug}`);
        const data = await response.json();
        if (data.post) {
          setPost(data.post);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Add lazy loading to all images in post content
  useEffect(() => {
    if (post) {
      const postBody = document.querySelector('.post-body');
      if (postBody) {
        const images = postBody.querySelectorAll('img');
        images.forEach(img => {
          if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
          }
        });
      }
    }
  }, [post]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!post) {
    return <div className="error">Post not found</div>;
  }

  return (
    <>
      <Helmet>
        <title>{post.metaTitle || post.title}</title>
        <meta name="description" content={post.metaDescription} />
        <link rel="canonical" href={`https://crackbuster.ca/blog/${slug}`} />
      </Helmet>

      <div className="blog-post">
        <article className="post-content-wrapper">
          <div className="container">
            <Link to="/blog" className="back-link">← Back to Blog</Link>
            <header className="post-header">
              <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
              <h1>{post.title}</h1>
            </header>
            <div 
              className="post-body" 
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogPost;

