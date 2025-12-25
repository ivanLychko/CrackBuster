const RemovedUrl = require('../models/RemovedUrl');

/**
 * Middleware to check if requested URL is in the removed URLs list
 * Returns 410 Gone status for removed URLs
 */
const checkRemovedUrls = async (req, res, next) => {
  try {
    // Skip API requests - they should be handled by API routes
    if (req.path.startsWith('/api/') || req.url.startsWith('/api/')) {
      return next();
    }
    
    // Skip admin routes
    if (req.path.startsWith('/admin/')) {
      return next();
    }
    
    // Skip static file requests (images, CSS, JS, etc.)
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.eot', '.ttf', '.otf', '.mp4', '.webp', '.json', '.xml', '.txt'];
    const hasStaticExtension = staticExtensions.some(ext => req.path.toLowerCase().endsWith(ext));
    if (hasStaticExtension) {
      return next();
    }
    
    // Check if URL is in removed URLs list
    const removed = await RemovedUrl.isRemoved(req.path);
    
    if (removed) {
      // Return 410 Gone status
      // Check if request accepts JSON (API requests or AJAX)
      const acceptsJson = req.accepts(['json', 'html']) === 'json' || 
                         req.headers.accept?.includes('application/json');
      
      if (acceptsJson) {
        res.status(410).json({
          error: 'Gone',
          message: 'This resource has been permanently removed.',
          url: req.path,
          removedAt: removed.removedAt || removed.createdAt
        });
      } else {
        // Return HTML for browser/Google Bot requests
        res.status(410).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>410 Gone</title>
              <meta charset="utf-8">
              <meta name="robots" content="noindex, nofollow">
            </head>
            <body>
              <h1>410 Gone</h1>
              <p>This resource has been permanently removed.</p>
              <p>The requested URL <code>${req.path}</code> is no longer available.</p>
            </body>
          </html>
        `);
      }
      return;
    }
    
    // URL is not removed, continue
    next();
  } catch (error) {
    // If there's an error checking removed URLs, log it but don't block the request
    console.error('Error checking removed URLs:', error);
    next();
  }
};

module.exports = checkRemovedUrls;

