const path = require('path');
const fs = require('fs');

/**
 * Middleware: when requesting .jpg/.jpeg/.png/.gif under /images/,
 * if the file doesn't exist but a .webp version does (after optimization),
 * serve the webp instead. This way code can keep using original paths
 * and no changes are needed after running image optimization.
 *
 * @param {string} imagesRoot - Absolute path to client/public/images
 */
function optimizedImageFallback(imagesRoot) {
    return (req, res, next) => {
        // Only handle /images/* requests for raster formats
        if (!req.path.startsWith('/images/')) {
            return next();
        }

        const match = req.path.match(/\.(jpg|jpeg|png|gif)$/i);
        if (!match) {
            return next();
        }

        // Requested path: /images/home/hero.jpg
        // Build path to .webp equivalent
        const webpPath = req.path.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
        const filePath = path.join(imagesRoot, webpPath.replace(/^\/images\//, ''));

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'image/webp');
            return res.sendFile(filePath);
        }

        next();
    };
}

module.exports = optimizedImageFallback;
