const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const { optimizeImage, optimizeForWeb } = require('../utils/imageOptimizer');

const router = express.Router();

// Apply auth to all image management routes
router.use(authMiddleware);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || 'general';
    const subfolder = req.body.subfolder || '';
    let uploadPath = path.join(__dirname, '../../client/public/images', category);
    
    if (subfolder) {
      uploadPath = path.join(uploadPath, subfolder);
    }
    
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

const fileFilter = (req, file, cb) => {
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

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// ===== OPTIMIZATION ROUTES (must be before general routes) =====

// Optimize multiple images (bulk) - must be before /optimize/:category/:filename
router.post('/optimize/bulk', async (req, res) => {
  try {
    const { images, quality, format, maxWidth, maxHeight } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    const results = [];
    const errors = [];

    for (const imagePath of images) {
      try {
        // Handle paths like "category/filename.ext"
        const pathParts = imagePath.split('/');
        if (pathParts.length < 2) {
          errors.push({ imagePath, error: 'Invalid image path format' });
          continue;
        }
        const category = pathParts[0];
        const filename = pathParts.slice(1).join('/'); // In case filename has slashes (unlikely but safe)
        const fullPath = path.join(__dirname, '../../client/public/images', category, filename);

        if (!fs.existsSync(fullPath)) {
          errors.push({ imagePath, error: 'Image not found' });
          continue;
        }

        const result = await optimizeImage(fullPath, {
          quality: quality ? parseInt(quality) : undefined,
          format: format || undefined,
          maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
          maxHeight: maxHeight ? parseInt(maxHeight) : undefined
        });

        const newFilename = path.basename(result.path);
        // URL for static files doesn't need encoding, Express.static handles it
        results.push({
          ...result,
          originalPath: imagePath,
          url: `/images/${category}/${newFilename}`,
          filename: newFilename,
          path: `${category}/${newFilename}`
        });
      } catch (error) {
        errors.push({ imagePath, error: error.message });
      }
    }

    res.json({
      message: `Optimized ${results.length} image(s)`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Web optimize multiple images (bulk) - must be before /optimize/web/:category/:filename
router.post('/optimize/web/bulk', async (req, res) => {
  try {
    const { images, maxWidth, maxHeight, quality } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    const results = [];
    const errors = [];

    for (const imagePath of images) {
      try {
        // Handle paths like "category/filename.ext"
        const pathParts = imagePath.split('/');
        if (pathParts.length < 2) {
          errors.push({ imagePath, error: 'Invalid image path format' });
          continue;
        }
        const category = pathParts[0];
        const filename = pathParts.slice(1).join('/'); // In case filename has slashes (unlikely but safe)
        const fullPath = path.join(__dirname, '../../client/public/images', category, filename);

        if (!fs.existsSync(fullPath)) {
          errors.push({ imagePath, error: 'Image not found' });
          continue;
        }

        const result = await optimizeForWeb(fullPath, {
          maxWidth: maxWidth ? parseInt(maxWidth) : 1920,
          maxHeight: maxHeight ? parseInt(maxHeight) : 1920,
          quality: quality ? parseInt(quality) : 85
        });

        const newFilename = path.basename(result.path);
        // URL for static files doesn't need encoding, Express.static handles it
        results.push({
          ...result,
          originalPath: imagePath,
          url: `/images/${category}/${newFilename}`,
          filename: newFilename,
          path: `${category}/${newFilename}`
        });
      } catch (error) {
        errors.push({ imagePath, error: error.message });
      }
    }

    res.json({
      message: `Web optimized ${results.length} image(s)`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optimize single image (supports subfolders: category/subfolder/filename)
router.post('/optimize/:category/:filename(*)', async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const filename = decodeURIComponent(req.params.filename);
    const { quality, format, maxWidth, maxHeight } = req.body;
    // filename may contain subfolder path, e.g., "subfolder/image.jpg"
    const imagePath = path.join(__dirname, '../../client/public/images', category, filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const result = await optimizeImage(imagePath, {
      quality: quality ? parseInt(quality) : undefined,
      format: format || undefined,
      maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
      maxHeight: maxHeight ? parseInt(maxHeight) : undefined
    });

    // Update filename if format changed
    const newFilename = path.basename(result.path);
    // Preserve subfolder path if exists
    const subfolderPath = path.dirname(filename) !== '.' ? path.dirname(filename) + '/' : '';
    // URL for static files doesn't need encoding, Express.static handles it
    const newUrl = subfolderPath 
      ? `/images/${category}/${subfolderPath}${newFilename}`
      : `/images/${category}/${newFilename}`;

    res.json({
      message: 'Image optimized successfully',
      result: {
        ...result,
        url: newUrl,
        filename: newFilename,
        path: subfolderPath ? `${category}/${subfolderPath}${newFilename}` : `${category}/${newFilename}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Web optimize single image (supports subfolders: category/subfolder/filename)
router.post('/optimize/web/:category/:filename(*)', async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const filename = decodeURIComponent(req.params.filename);
    const { maxWidth, maxHeight, quality } = req.body;
    // filename may contain subfolder path, e.g., "subfolder/image.jpg"
    const imagePath = path.join(__dirname, '../../client/public/images', category, filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const result = await optimizeForWeb(imagePath, {
      maxWidth: maxWidth ? parseInt(maxWidth) : 1920,
      maxHeight: maxHeight ? parseInt(maxHeight) : 1920,
      quality: quality ? parseInt(quality) : 85
    });

    // Update filename (will be .webp now)
    const newFilename = path.basename(result.path);
    // Preserve subfolder path if exists
    const subfolderPath = path.dirname(filename) !== '.' ? path.dirname(filename) + '/' : '';
    // URL for static files doesn't need encoding, Express.static handles it
    const newUrl = subfolderPath 
      ? `/images/${category}/${subfolderPath}${newFilename}`
      : `/images/${category}/${newFilename}`;

    res.json({
      message: 'Image optimized for web successfully',
      result: {
        ...result,
        url: newUrl,
        filename: newFilename,
        path: subfolderPath ? `${category}/${subfolderPath}${newFilename}` : `${category}/${newFilename}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== GENERAL ROUTES =====

// Helper function to recursively get all images from a folder
function getAllImagesInFolder(folderPath, category, baseSubfolder = '') {
  const images = [];
  
  if (!fs.existsSync(folderPath)) {
    return images;
  }

  const items = fs.readdirSync(folderPath, { withFileTypes: true });
  
  items.forEach(item => {
    const itemPath = path.join(folderPath, item.name);
    const relativePath = baseSubfolder ? `${baseSubfolder}/${item.name}` : item.name;
    
    if (item.isDirectory()) {
      // Recursively get images from subfolders
      images.push(...getAllImagesInFolder(itemPath, category, relativePath));
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        const url = baseSubfolder 
          ? `/images/${category}/${relativePath}`
          : `/images/${category}/${item.name}`;
        
        images.push({
          name: item.name,
          url: url,
          path: `${category}/${relativePath}`,
          size: fs.statSync(itemPath).size,
          modified: fs.statSync(itemPath).mtime
        });
      }
    }
  });
  
  return images;
}

// Get all images in a folder (recursively) - must be before /:category?
router.get('/folder/:category/images', (req, res) => {
  try {
    const category = req.params.category;
    const subfolder = req.query.subfolder || '';
    
    let folderPath = path.join(__dirname, '../../client/public/images', category);
    if (subfolder) {
      folderPath = path.join(folderPath, subfolder);
    }
    
    if (!fs.existsSync(folderPath)) {
      return res.json({ images: [] });
    }

    const images = getAllImagesInFolder(folderPath, category, subfolder);
    
    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all images by category (supports subfolders)
router.get('/:category?', (req, res) => {
  try {
    const category = req.params.category || 'general';
    const subfolder = req.query.subfolder || ''; // Support subfolder parameter
    
    let imagesPath = path.join(__dirname, '../../client/public/images', category);
    if (subfolder) {
      imagesPath = path.join(imagesPath, subfolder);
    }
    
    if (!fs.existsSync(imagesPath)) {
      return res.json({ images: [], folders: [], category, subfolder: subfolder || null });
    }

    const items = fs.readdirSync(imagesPath, { withFileTypes: true });
    const folders = [];
    const images = [];

    items.forEach(item => {
      const itemPath = path.join(imagesPath, item.name);
      
      if (item.isDirectory()) {
        folders.push({
          name: item.name,
          path: subfolder ? `${subfolder}/${item.name}` : item.name
        });
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          const relativePath = subfolder ? `${subfolder}/${item.name}` : item.name;
          const url = subfolder 
            ? `/images/${category}/${subfolder}/${item.name}`
            : `/images/${category}/${item.name}`;
          
          images.push({
            name: item.name,
            url: url,
            path: path.join(category, relativePath),
            size: fs.statSync(itemPath).size,
            modified: fs.statSync(itemPath).mtime
          });
        }
      }
    });

    // Sort folders alphabetically
    folders.sort((a, b) => a.name.localeCompare(b.name));
    
    // Sort images by modification date (newest first)
    images.sort((a, b) => b.modified - a.modified);

    res.json({ 
      images, 
      folders,
      category, 
      subfolder: subfolder || null,
      parentPath: subfolder ? subfolder.split('/').slice(0, -1).join('/') : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
router.get('/categories/list', (req, res) => {
  try {
    const imagesPath = path.join(__dirname, '../../client/public/images');
    
    if (!fs.existsSync(imagesPath)) {
      return res.json({ categories: [] });
    }

    const categories = fs.readdirSync(imagesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort();

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image(s)
router.post('/upload', upload.array('images', 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const category = req.body.category || 'general';
    const subfolder = req.body.subfolder || '';
    const pathPrefix = subfolder ? `${category}/${subfolder}` : category;
    const urlPrefix = subfolder ? `/images/${category}/${subfolder}` : `/images/${category}`;
    
    const uploaded = req.files.map(file => ({
      name: file.filename,
      url: `${urlPrefix}/${file.filename}`,
      path: `${pathPrefix}/${file.filename}`,
      size: file.size
    }));

    res.json({ 
      message: 'Images uploaded successfully',
      images: uploaded
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete image (supports subfolders: category/subfolder/filename)
router.delete('/:category/:filename(*)', (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const filename = decodeURIComponent(req.params.filename);
    // filename may contain subfolder path, e.g., "subfolder/image.jpg"
    const imagePath = path.join(__dirname, '../../client/public/images', category, filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    fs.unlinkSync(imagePath);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category
router.post('/categories', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categoryPath = path.join(__dirname, '../../client/public/images', name);
    
    if (fs.existsSync(categoryPath)) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    fs.mkdirSync(categoryPath, { recursive: true });
    res.json({ message: 'Category created successfully', category: name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category
router.delete('/categories/:name', (req, res) => {
  try {
    const { name } = req.params;
    const categoryPath = path.join(__dirname, '../../client/public/images', name);

    if (!fs.existsSync(categoryPath)) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category is empty
    const files = fs.readdirSync(categoryPath);
    if (files.length > 0) {
      return res.status(400).json({ error: 'Category is not empty. Delete all images first.' });
    }

    fs.rmdirSync(categoryPath);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

