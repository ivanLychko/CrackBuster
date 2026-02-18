const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const BlogPost = require('../models/BlogPost');
const Service = require('../models/Service');
const Work = require('../models/Work');
const Contact = require('../models/Contact');
const SiteSettings = require('../models/SiteSettings');
const SEO = require('../models/SEO');
const RemovedUrl = require('../models/RemovedUrl');
const GoogleReview = require('../models/GoogleReview');
const GoogleReviewSettings = require('../models/GoogleReviewSettings');
const googleReviewsService = require('../utils/googleReviewsService');

// Apply auth to all admin routes
router.use(authMiddleware);

// ========== SERVICES ==========
// Get all services
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single service
router.get('/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create service
router.post('/services', async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.json({ service, message: 'Service created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update service
router.put('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ service, message: 'Service updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete service
router.delete('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== BLOG POSTS ==========
// Get all blog posts
router.get('/blog', async (req, res) => {
  try {
    const posts = await BlogPost.find({}).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single blog post
router.get('/blog/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create blog post
router.post('/blog', async (req, res) => {
  try {
    const post = new BlogPost(req.body);
    await post.save();
    res.json({ post, message: 'Blog post created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update blog post
router.put('/blog/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post, message: 'Blog post updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete blog post
router.delete('/blog/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== WORKS ==========
// Get all works
router.get('/works', async (req, res) => {
  try {
    const works = await Work.find({}).sort({ completedAt: -1 });
    res.json({ works });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single work
router.get('/works/:id', async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ error: 'Work not found' });
    }
    res.json({ work });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create work
router.post('/works', async (req, res) => {
  try {
    const work = new Work(req.body);
    await work.save();
    res.json({ work, message: 'Work created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update work
router.put('/works/:id', async (req, res) => {
  try {
    const work = await Work.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!work) {
      return res.status(404).json({ error: 'Work not found' });
    }
    res.json({ work, message: 'Work updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete work
router.delete('/works/:id', async (req, res) => {
  try {
    const work = await Work.findByIdAndDelete(req.params.id);
    if (!work) {
      return res.status(404).json({ error: 'Work not found' });
    }
    res.json({ message: 'Work deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ESTIMATE REQUESTS ==========
// Get all estimate requests
router.get('/estimate-requests', async (req, res) => {
  try {
    const requests = await Contact.find({ type: 'estimate' }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update estimate request status
router.put('/estimate-requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!request) {
      return res.status(404).json({ error: 'Estimate request not found' });
    }
    if (request.type !== 'estimate') {
      return res.status(400).json({ error: 'Not an estimate request' });
    }
    res.json({ request, message: 'Status updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete estimate request
router.delete('/estimate-requests/:id', async (req, res) => {
  try {
    const request = await Contact.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Estimate request not found' });
    }
    if (request.type !== 'estimate') {
      return res.status(400).json({ error: 'Not an estimate request' });
    }

    // Delete associated images
    if (request.images && request.images.length > 0) {
      request.images.forEach(imagePath => {
        // Remove leading slash if present
        const relativePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        const filePath = path.join(__dirname, '../../client/public', relativePath);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error('Error deleting image file:', err);
          }
        }
      });
    }

    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Estimate request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== CONTACT REQUESTS ==========
// Get all contact requests
router.get('/contact-requests', async (req, res) => {
  try {
    const requests = await Contact.find({ type: 'contact' }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact request status
router.put('/contact-requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!request) {
      return res.status(404).json({ error: 'Contact request not found' });
    }
    if (request.type !== 'contact') {
      return res.status(400).json({ error: 'Not a contact request' });
    }
    res.json({ request, message: 'Status updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete contact request
router.delete('/contact-requests/:id', async (req, res) => {
  try {
    const request = await Contact.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Contact request not found' });
    }
    if (request.type !== 'contact') {
      return res.status(400).json({ error: 'Not a contact request' });
    }

    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SITE SETTINGS ==========
// Get site settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update site settings
router.put('/settings', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(req.body);
      await settings.save();
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== SEO SETTINGS ==========
// Get all SEO settings
router.get('/seo', async (req, res) => {
  try {
    const seo = await SEO.getAllSEO();
    res.json({ seo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SEO for specific page
router.get('/seo/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const seo = await SEO.getSEO(page);
    res.json({ seo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update SEO for specific page
router.put('/seo/:page', async (req, res) => {
  try {
    const { page } = req.params;
    let seo = await SEO.findOne({ page });
    if (!seo) {
      seo = new SEO({ page, ...req.body });
      await seo.save();
    } else {
      Object.assign(seo, req.body);
      await seo.save();
    }
    res.json({ seo, message: 'SEO settings updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== REMOVED URLS ==========
// Get all removed URLs
router.get('/removed-urls', async (req, res) => {
  try {
    const removedUrls = await RemovedUrl.find({}).sort({ createdAt: -1 });
    res.json({ removedUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single removed URL
router.get('/removed-urls/:id', async (req, res) => {
  try {
    const removedUrl = await RemovedUrl.findById(req.params.id);
    if (!removedUrl) {
      return res.status(404).json({ error: 'Removed URL not found' });
    }
    res.json({ removedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create removed URL
router.post('/removed-urls', async (req, res) => {
  try {
    const { url, reason, notes } = req.body;
    
    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Check if URL already exists
    const existing = await RemovedUrl.findOne({ url: url.trim() });
    if (existing) {
      return res.status(400).json({ error: 'This URL is already in the removed URLs list' });
    }
    
    const removedUrl = new RemovedUrl({
      url: url.trim(),
      reason: reason || '',
      notes: notes || '',
      removedAt: new Date()
    });
    
    await removedUrl.save();
    res.json({ removedUrl, message: 'Removed URL added successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update removed URL
router.put('/removed-urls/:id', async (req, res) => {
  try {
    const { url, reason, notes } = req.body;
    
    const removedUrl = await RemovedUrl.findById(req.params.id);
    if (!removedUrl) {
      return res.status(404).json({ error: 'Removed URL not found' });
    }
    
    // If URL is being changed, check for duplicates
    if (url && url.trim() !== removedUrl.url) {
      const existing = await RemovedUrl.findOne({ url: url.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ error: 'This URL is already in the removed URLs list' });
      }
      removedUrl.url = url.trim();
    }
    
    if (reason !== undefined) removedUrl.reason = reason;
    if (notes !== undefined) removedUrl.notes = notes;
    
    await removedUrl.save();
    res.json({ removedUrl, message: 'Removed URL updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete removed URL
router.delete('/removed-urls/:id', async (req, res) => {
  try {
    const removedUrl = await RemovedUrl.findByIdAndDelete(req.params.id);
    if (!removedUrl) {
      return res.status(404).json({ error: 'Removed URL not found' });
    }
    res.json({ message: 'Removed URL deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== GOOGLE REVIEWS ==========
// Get Google Review settings
router.get('/google-reviews/settings', async (req, res) => {
  try {
    const settings = await GoogleReviewSettings.getSettings();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Google Review settings
router.put('/google-reviews/settings', async (req, res) => {
  try {
    const settings = await GoogleReviewSettings.updateSettings(req.body);
    res.json({ settings, message: 'Google Review settings updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync Google Reviews
router.post('/google-reviews/sync', async (req, res) => {
  try {
    const result = await googleReviewsService.syncReviews();
    res.json({ 
      ...result,
      message: result.message || 'Reviews synced successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Google Reviews
router.get('/google-reviews', async (req, res) => {
  try {
    const reviews = await GoogleReview.getAllReviews();
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single Google Review
router.get('/google-reviews/:id', async (req, res) => {
  try {
    const review = await GoogleReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Google Review (toggle active status, etc.)
router.put('/google-reviews/:id', async (req, res) => {
  try {
    const review = await GoogleReview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ review, message: 'Review updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Google Review
router.delete('/google-reviews/:id', async (req, res) => {
  try {
    const review = await GoogleReview.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

