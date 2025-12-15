import React, { useState, useEffect } from 'react';
import ImagePicker from './ImagePicker';
import './AdminCommon.scss';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    published: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog', {
        credentials: 'include'
      });
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

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchPosts();
        resetForm();
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
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      featuredImage: post.featuredImage || '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      keywords: (post.keywords || []).join(', '),
      published: post.published || false
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        credentials: 'include'
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
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      published: false
    });
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Manage Blog Posts</h1>
        <button onClick={resetForm} className="btn btn-primary">
          + Add New Post
        </button>
      </div>

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
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label>Content *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows="15"
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
          <textarea
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            rows="2"
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

      <div className="admin-list">
        <h2>Existing Posts</h2>
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

