const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const BlogPost = require('../models/BlogPost');
const Service = require('../models/Service');
const Work = require('../models/Work');
const Contact = require('../models/Contact');
const SiteSettings = require('../models/SiteSettings');
const SEO = require('../models/SEO');
const { sendEstimateEmail, sendContactEmail } = require('../utils/emailService');

// Configure multer for estimate image uploads
const estimateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../client/public/images/estimate-requests');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: originalname-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const estimateFileFilter = (req, file, cb) => {
  // Accept only image files
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const uploadEstimateImages = multer({
  storage: estimateStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files
  },
  fileFilter: estimateFileFilter
});

// Blog routes
router.get('/blog', async (req, res) => {
  try {
    const posts = await BlogPost.find({ published: true })
      .sort({ publishedAt: -1 })
      .select('title slug excerpt featuredImage publishedAt');
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/blog/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Services routes
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find({})
      .sort({ featured: -1, createdAt: -1 })
      .select('title slug description image featured');
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/services/:slug', async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to check if image file exists
function checkImageExists(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/images/')) {
    return false;
  }

  // Remove leading /images/ to get relative path
  const relativePath = imageUrl.replace(/^\/images\//, '');
  const fullPath = path.join(__dirname, '../../client/public/images', relativePath);

  // Check if file exists
  if (fs.existsSync(fullPath)) {
    return true;
  }

  // Check for alternative formats (e.g., if .jpg was converted to .webp)
  const ext = path.extname(fullPath).toLowerCase();
  const basePath = fullPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

  const alternativeExts = ['.webp', '.jpg', '.jpeg', '.png', '.gif'];
  for (const altExt of alternativeExts) {
    if (altExt !== ext && fs.existsSync(basePath + altExt)) {
      return true;
    }
  }

  return false;
}

// Our Works routes
router.get('/works', async (req, res) => {
  try {
    const works = await Work.find({})
      .sort({ featured: -1, completedAt: -1 })
      .populate('service', 'title slug')
      .select('title description images service location completedAt featured');

    // Filter out non-existent images and update paths if format changed
    const worksWithValidImages = works.map(work => {
      if (!work.images || !Array.isArray(work.images)) {
        return work.toObject();
      }

      const validImages = work.images.filter(img => {
        if (!img) return false;

        // Check if original path exists
        if (checkImageExists(img)) {
          return true;
        }

        // Try to find alternative format
        if (img.startsWith('/images/')) {
          const relativePath = img.replace(/^\/images\//, '');
          const fullPath = path.join(__dirname, '../../client/public/images', relativePath);
          const ext = path.extname(fullPath).toLowerCase();
          const basePath = fullPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

          // Check for webp version (most common after optimization)
          if (ext !== '.webp' && fs.existsSync(basePath + '.webp')) {
            return true; // Will be updated below
          }
        }

        return false;
      }).map(img => {
        // Update path if format changed (e.g., .jpg -> .webp)
        if (img && img.startsWith('/images/')) {
          const relativePath = img.replace(/^\/images\//, '');
          const fullPath = path.join(__dirname, '../../client/public/images', relativePath);

          if (!fs.existsSync(fullPath)) {
            const ext = path.extname(fullPath).toLowerCase();
            const basePath = fullPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

            // Check for webp version first (most common after optimization)
            if (ext !== '.webp' && fs.existsSync(basePath + '.webp')) {
              const newRelativePath = relativePath.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
              return `/images/${newRelativePath}`;
            }
          }
        }

        return img;
      });

      return {
        ...work.toObject(),
        images: validImages
      };
    });

    res.json({ works: worksWithValidImages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const contact = new Contact({
      name,
      email,
      phone,
      message,
      type: 'contact'
    });
    await contact.save();

    // Send email notification
    const emailResult = await sendContactEmail({ name, email, phone, message });

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      // Don't fail the request if email fails, just log it
    }

    res.json({ success: true, message: 'Thank you for contacting us!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estimate form submission with image uploads
router.post('/estimate', uploadEstimateImages.array('images', 10), async (req, res) => {
  try {
    const { name, email, phone, address, description } = req.body;

    // Validate that at least one image is uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'At least one image is required for estimate requests'
      });
    }

    // Get uploaded image paths
    const imagePaths = req.files.map(file => `/images/estimate-requests/${file.filename}`);

    const contact = new Contact({
      name,
      email,
      phone,
      address,
      description,
      message: description,
      type: 'estimate',
      images: imagePaths
    });
    await contact.save();

    // Send email notification
    const emailResult = await sendEstimateEmail(
      { name, email, phone, address, description },
      imagePaths
    );

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      // Don't fail the request if email fails, just log it
    }

    res.json({
      success: true,
      message: 'Estimate request received!',
      imagesCount: imagePaths.length
    });
  } catch (error) {
    // Clean up uploaded files if there was an error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../../client/public/images/estimate-requests', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// Site Settings routes (public - get only)
router.get('/settings', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SEO routes (public - get only)
router.get('/seo/:page', async (req, res) => {
  try {
    const { page } = req.params;
    // Explicitly set Content-Type FIRST to ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    const seo = await SEO.getSEO(page);
    res.json({ seo });
  } catch (error) {
    console.error('SEO API error:', error);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(500).json({ error: error.message });
  }
});

// Get all SEO data (public)
router.get('/seo', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    const seo = await SEO.getAllSEO();
    res.json({ seo });
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(500).json({ error: error.message });
  }
});

// 404 handler for API routes - always return JSON
router.use((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(404).json({ error: 'API endpoint not found', path: req.path });
});

module.exports = router;

