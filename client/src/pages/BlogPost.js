import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useSEO from '../hooks/useSEO';
import { getCanonicalUrl, getDefaultOgImage } from '../utils/seo';
import './BlogPost.scss';

const BlogPost = () => {
  const { slug } = useParams();
  const { seo: seoTemplate } = useSEO(); // Get template SEO for blog-post
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

  // Add lazy loading and styling to all images in post content
  useEffect(() => {
    if (post) {
      const postBody = document.querySelector('.post-body');
      if (postBody) {
        const images = postBody.querySelectorAll('img');
        images.forEach(img => {
          if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
          }
          // Add styling to images if they don't have classes
          if (!img.className) {
            img.className = 'post-image-content';
          }
        });

        // Style headings
        const headings = postBody.querySelectorAll('h2, h3, h4');
        headings.forEach(heading => {
          if (!heading.className) {
            heading.className = `post-heading-${heading.tagName.toLowerCase()}`;
          }
        });

        // Style paragraphs
        const paragraphs = postBody.querySelectorAll('p');
        paragraphs.forEach(p => {
          if (!p.className && p.textContent.trim()) {
            p.className = 'post-paragraph';
          }
        });

        // Style lists
        const lists = postBody.querySelectorAll('ul, ol');
        lists.forEach(list => {
          if (!list.className) {
            list.className = 'post-list';
          }
        });

        // Style blockquotes
        const blockquotes = postBody.querySelectorAll('blockquote');
        blockquotes.forEach(blockquote => {
          if (!blockquote.className) {
            blockquote.className = 'post-blockquote';
          }
        });

        // Style links
        const links = postBody.querySelectorAll('a');
        links.forEach(link => {
          if (!link.className) {
            link.className = 'post-link';
          }
        });
      }
    }
  }, [post]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog-post">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-post">
        <div className="error">
          <div className="error-icon">❌</div>
          <h2>Post not found</h2>
          <p>The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="back-link">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  // Prepare structured data
  const postImage = post.featuredImage || post.image ? getCanonicalUrl(post.featuredImage || post.image) : getDefaultOgImage();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription || post.excerpt,
    "image": postImage,
    "datePublished": post.publishedAt ? new Date(post.publishedAt).toISOString() : "",
    "author": {
      "@type": "Organization",
      "name": "CrackBuster"
    },
    "publisher": {
      "@type": "LocalBusiness",
      "name": "CrackBuster",
      "logo": {
        "@type": "ImageObject",
        "url": getCanonicalUrl('/images/logo.png')
      }
    }
  };

  // Priority: Individual SEO > Basic Meta > Template SEO > Fallbacks
  const title = post ? (
    post.seoTitle || post.metaTitle || post.title
  ) : (
    seoTemplate?.title || 'Blog Post | CrackBuster Blog'
  );
  
  const description = post ? (
    post.seoDescription || post.metaDescription || post.excerpt
  ) : (
    seoTemplate?.description || ''
  );
  
  const keywords = post ? (
    post.seoKeywords || post.keywords?.join(', ')
  ) : (
    seoTemplate?.keywords || ''
  );
  
  const ogTitle = post ? (
    post.ogTitle || post.seoTitle || post.metaTitle || post.title
  ) : (
    seoTemplate?.ogTitle || title
  );
  
  const ogDescription = post ? (
    post.ogDescription || post.seoDescription || post.metaDescription || post.excerpt
  ) : (
    seoTemplate?.ogDescription || description
  );
  
  const ogImage = post?.ogImage ? (
    post.ogImage.startsWith('http') ? post.ogImage : getCanonicalUrl(post.ogImage)
  ) : (
    postImage || (seoTemplate?.ogImage ? (seoTemplate.ogImage.startsWith('http') ? seoTemplate.ogImage : getCanonicalUrl(seoTemplate.ogImage)) : getDefaultOgImage())
  );
  
  const twitterTitle = post ? (
    post.twitterTitle || post.ogTitle || post.seoTitle || post.metaTitle || post.title
  ) : (
    seoTemplate?.twitterTitle || ogTitle
  );
  
  const twitterDescription = post ? (
    post.twitterDescription || post.ogDescription || post.seoDescription || post.metaDescription || post.excerpt
  ) : (
    seoTemplate?.twitterDescription || ogDescription
  );
  
  const twitterImage = post?.twitterImage ? (
    post.twitterImage.startsWith('http') ? post.twitterImage : getCanonicalUrl(post.twitterImage)
  ) : (
    seoTemplate?.twitterImage ? (seoTemplate.twitterImage.startsWith('http') ? seoTemplate.twitterImage : getCanonicalUrl(seoTemplate.twitterImage)) : ogImage
  );
  
  const canonical = post?.canonicalUrl || seoTemplate?.canonicalUrl || getCanonicalUrl(`/blog/${slug}`);
  const robots = post?.robots || seoTemplate?.robots || '';

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
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        {post?.publishedAt && <meta property="article:published_time" content={new Date(post.publishedAt).toISOString()} />}
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

      <div className="blog-post">
        <article className="post-content-wrapper">
          <div className="container">
            <Link to="/blog" className="back-link">
              <span className="back-icon">←</span>
              <span>Back to Blog</span>
            </Link>
            <header className="post-header">
              <div className="post-meta-info">
                <time className="post-date">
                  <span className="date-icon">📅</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </time>
                {post.keywords && post.keywords.length > 0 && (
                  <div className="post-tags">
                    {post.keywords.map((keyword, index) => (
                      <span key={index} className="tag">
                        <span className="tag-icon">🏷️</span>
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h1>{post.title}</h1>
              {post.excerpt && (
                <p className="post-excerpt-header">{post.excerpt}</p>
              )}
            </header>

            <div className="post-body-wrapper">
              <div
                className="post-body"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            <footer className="post-footer">
              <div className="post-footer-content">
                <div className="footer-section">
                  <h3>Need Help?</h3>
                  <p>If you have questions about foundation repair or need professional assistance, don't hesitate to contact us.</p>
                  <Link to="/contact-us" className="footer-cta">
                    <span className="cta-icon">📞</span>
                    <span>Contact Us</span>
                  </Link>
                </div>
                <div className="footer-section">
                  <h3>Get a Free Estimate</h3>
                  <p>Ready to fix your foundation? Get a free, no-obligation estimate from our experts.</p>
                  <Link to="/get-estimate" className="footer-cta">
                    <span className="cta-icon">💰</span>
                    <span>Get Estimate</span>
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogPost;

