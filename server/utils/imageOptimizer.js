const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Optimize a single image
 * @param {string} imagePath - Full path to the image file
 * @param {Object} options - Optimization options
 * @returns {Promise<Object>} - Result with new size and path
 */
async function optimizeImage(imagePath, options = {}) {
  const {
    quality = 85,
    format = null, // null means keep original format
    maxWidth = null,
    maxHeight = null,
    convertToWebP = false
  } = options;

  if (!fs.existsSync(imagePath)) {
    throw new Error('Image file not found');
  }

  const ext = path.extname(imagePath).toLowerCase();
  const isJpeg = ['.jpg', '.jpeg'].includes(ext);
  const isPng = ext === '.png';
  const isWebP = ext === '.webp';

  if (!isJpeg && !isPng && !isWebP && !convertToWebP) {
    throw new Error('Only JPG, PNG and WebP images can be optimized');
  }

  // WebP can be re-optimized (resize + quality) to reduce file size
  if (isWebP && !convertToWebP) {
    // Output stays WebP, same path
  }

  let sharpInstance = sharp(imagePath);
  const metadata = await sharpInstance.metadata();

  // Resize if needed
  if (maxWidth || maxHeight) {
    const width = maxWidth || metadata.width;
    const height = maxHeight || metadata.height;
    sharpInstance = sharpInstance.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // Determine output format and path
  let outputPath = imagePath;
  let outputFormat = format || (isWebP ? 'webp' : ext.replace('.', ''));

  if (convertToWebP) {
    outputFormat = 'webp';
    outputPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  } else if (format) {
    outputPath = imagePath.replace(ext, `.${format}`);
  } else if (isWebP) {
    outputPath = imagePath; // Re-optimize in place
  }

  // Apply format-specific optimizations
  if (outputFormat === 'webp') {
    sharpInstance = sharpInstance.webp({ quality });
  } else if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
    sharpInstance = sharpInstance.jpeg({ 
      quality,
      mozjpeg: true // Better compression
    });
  } else if (outputFormat === 'png') {
    sharpInstance = sharpInstance.png({ 
      quality,
      compressionLevel: 9,
      adaptiveFiltering: true
    });
  }

  // Get original size
  const originalSize = fs.statSync(imagePath).size;

  // If output path is same as input, use temporary file to avoid "same file" error
  const isSameFile = outputPath === imagePath;
  let tempPath = outputPath;
  
  if (isSameFile) {
    // Create temporary file path
    const dir = path.dirname(imagePath);
    const ext = path.extname(imagePath);
    const basename = path.basename(imagePath, ext);
    tempPath = path.join(dir, `${basename}.tmp${ext}`);
  }

  // Process and save to temp file or output file
  await sharpInstance.toFile(tempPath);

  // If we used a temp file, replace original with it
  if (isSameFile) {
    // Remove original file
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    // Rename temp file to original name
    fs.renameSync(tempPath, imagePath);
    tempPath = imagePath;
  } else {
    // Format changed - remove original file if output file exists
    if (fs.existsSync(tempPath) && tempPath !== imagePath) {
      fs.unlinkSync(imagePath);
    }
  }

  const finalPath = isSameFile ? imagePath : tempPath;
  const newSize = fs.statSync(finalPath).size;
  const savedBytes = originalSize - newSize;
  const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

  return {
    success: true,
    originalSize,
    newSize,
    savedBytes,
    savedPercent,
    path: finalPath,
    format: outputFormat
  };
}

/**
 * Optimize image for web (convert to WebP, resize if large, optimize)
 * @param {string} imagePath - Full path to the image file
 * @param {Object} options - Optimization options
 * @returns {Promise<Object>} - Result with new size and path
 */
async function optimizeForWeb(imagePath, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 85
  } = options;

  // WebP can be re-optimized (resize + lower quality) to reduce file size
  const ext = path.extname(imagePath).toLowerCase();
  const isWebP = ext === '.webp';

  return optimizeImage(imagePath, {
    convertToWebP: !isWebP,
    maxWidth,
    maxHeight,
    quality
  });
}

/**
 * Get image metadata
 * @param {string} imagePath - Full path to the image file
 * @returns {Promise<Object>} - Image metadata
 */
async function getImageMetadata(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error('Image file not found');
  }

  const metadata = await sharp(imagePath).metadata();
  const stats = fs.statSync(imagePath);

  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: stats.size,
    hasAlpha: metadata.hasAlpha
  };
}

module.exports = {
  optimizeImage,
  optimizeForWeb,
  getImageMetadata
};

