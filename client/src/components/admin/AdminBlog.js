import React, { useState, useEffect } from 'react';
import ImagePicker from './ImagePicker';
import RichTextEditor from './RichTextEditor';
import { authenticatedFetch } from '../../utils/auth';
import './AdminCommon.scss';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    published: false,
    // Extended SEO fields
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonicalUrl: '',
    robots: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/blog');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing 
        ? `/api/admin/blog/${editing._id}`
        : '/api/admin/blog';
      
      const method = editing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        publishedAt: formData.published ? (editing?.publishedAt || new Date()) : null
      };

      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchPosts();
        resetForm();
        setShowForm(false);
        alert(editing ? 'Post updated!' : 'Post created!');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to save'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (post) => {
    setEditing(post);
    setShowForm(true);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      featuredImage: post.featuredImage || '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      keywords: (post.keywords || []).join(', '),
      published: post.published || false,
      // Extended SEO fields
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      seoKeywords: post.seoKeywords || '',
      ogTitle: post.ogTitle || '',
      ogDescription: post.ogDescription || '',
      ogImage: post.ogImage || '',
      twitterTitle: post.twitterTitle || '',
      twitterDescription: post.twitterDescription || '',
      twitterImage: post.twitterImage || '',
      canonicalUrl: post.canonicalUrl || '',
      robots: post.robots || ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await authenticatedFetch(`/api/admin/blog/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchPosts();
        alert('Post deleted!');
      } else {
        alert('Error deleting post');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      published: false,
      // Extended SEO fields
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
      canonicalUrl: '',
      robots: ''
    });
  };

  const handleNewPost = () => {
    resetForm();
    setShowForm(true);
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Manage Blog Posts</h1>
        {!showForm && (
          <button onClick={handleNewPost} className="btn btn-primary">
            + Add New Post
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Excerpt *</label>
          <RichTextEditor
            value={formData.excerpt}
            onChange={(value) => setFormData(prev => ({ ...prev, excerpt: value }))}
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label>Content *</label>
          <RichTextEditor
            value={formData.content}
            onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
            rows={15}
            required
          />
        </div>

        <div className="form-group">
          <ImagePicker
            value={formData.featuredImage}
            onChange={(url) => setFormData({ ...formData, featuredImage: url })}
            category="stock"
            label="Featured Image"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
              Published
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Meta Title</label>
          <input
            type="text"
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Meta Description</label>
          <RichTextEditor
            value={formData.metaDescription}
            onChange={(value) => setFormData(prev => ({ ...prev, metaDescription: value }))}
            rows={2}
          />
        </div>

        <div className="form-group">
          <label>Keywords (comma separated)</label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="foundation, repair, crack"
          />
        </div>

        <div className="form-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e0e0e0' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#031167' }}>Extended SEO Settings</h3>
          <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
            These fields override the basic meta tags above. Leave empty to use basic meta tags or template SEO.
          </p>

          <div className="form-group">
            <label>SEO Title</label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              placeholder="Leave empty to use Meta Title or template"
            />
            <p className="form-hint">Page title for search engines. If empty, Meta Title will be used.</p>
          </div>

          <div className="form-group">
            <label>SEO Description</label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              rows="3"
              placeholder="Leave empty to use Meta Description or template"
            />
            <p className="form-hint">Meta description for search engines. If empty, Meta Description will be used.</p>
          </div>

          <div className="form-group">
            <label>SEO Keywords</label>
            <input
              type="text"
              value={formData.seoKeywords}
              onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
              placeholder="Leave empty to use Keywords above or template"
            />
            <p className="form-hint">Comma-separated keywords. If empty, Keywords above will be used.</p>
          </div>

          <div className="form-group">
            <label>Open Graph Title</label>
            <input
              type="text"
              value={formData.ogTitle}
              onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
              placeholder="Leave empty to use SEO Title or template"
            />
            <p className="form-hint">Title for social media sharing (Facebook, LinkedIn).</p>
          </div>

          <div className="form-group">
            <label>Open Graph Description</label>
            <textarea
              value={formData.ogDescription}
              onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
              rows="3"
              placeholder="Leave empty to use SEO Description or template"
            />
            <p className="form-hint">Description for social media sharing.</p>
          </div>

          <div className="form-group">
            <label>Open Graph Image URL</label>
            <input
              type="text"
              value={formData.ogImage}
              onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
              placeholder="/images/og-image.jpg or full URL"
            />
            <p className="form-hint">Image URL for social media sharing (1200x630px recommended).</p>
          </div>

          <div className="form-group">
            <label>Twitter Title</label>
            <input
              type="text"
              value={formData.twitterTitle}
              onChange={(e) => setFormData({ ...formData, twitterTitle: e.target.value })}
              placeholder="Leave empty to use OG Title or template"
            />
            <p className="form-hint">Title for Twitter sharing.</p>
          </div>

          <div className="form-group">
            <label>Twitter Description</label>
            <textarea
              value={formData.twitterDescription}
              onChange={(e) => setFormData({ ...formData, twitterDescription: e.target.value })}
              rows="3"
              placeholder="Leave empty to use OG Description or template"
            />
            <p className="form-hint">Description for Twitter sharing.</p>
          </div>

          <div className="form-group">
            <label>Twitter Image URL</label>
            <input
              type="text"
              value={formData.twitterImage}
              onChange={(e) => setFormData({ ...formData, twitterImage: e.target.value })}
              placeholder="Leave empty to use OG Image"
            />
            <p className="form-hint">Image URL for Twitter sharing.</p>
          </div>

          <div className="form-group">
            <label>Canonical URL</label>
            <input
              type="text"
              value={formData.canonicalUrl}
              onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
              placeholder="Leave empty for auto-generated URL"
            />
            <p className="form-hint">Canonical URL for this page. Usually auto-generated.</p>
          </div>

          <div className="form-group">
            <label>Robots Meta Tag</label>
            <input
              type="text"
              value={formData.robots}
              onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
              placeholder="Leave empty to use global setting"
            />
            <p className="form-hint">Override robots meta tag (e.g., "noindex, nofollow"). Leave empty for default.</p>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editing ? 'Update Post' : 'Create Post'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
      )}

      <div className="admin-list">
        <h2>All Posts</h2>
        {posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post._id}>
                  <td>{post.title}</td>
                  <td>{post.slug}</td>
                  <td>{post.published ? '✓' : '✗'}</td>
                  <td>
                    <button onClick={() => handleEdit(post)} className="btn-small btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(post._id)} className="btn-small btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminBlog;

