const path = require('path');
const fs = require('fs');

/**
 * Middleware: when requesting .jpg/.jpeg/.png/.gif under /images/,
 * if the file doesn't exist but a .webp version does (after optimization),
 * serve the webp instead. This way code can keep using original paths
 * and no changes are needed after running image optimization.
 *
 * @param {string} publicImagesRoot - Absolute path to client/public/images (dev)
 * @param {string} distImagesRoot - Absolute path to dist/client/images (production build)
 */
function optimizedImageFallback(publicImagesRoot, distImagesRoot) {
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
        const relativePath = webpPath.replace(/^\/images\//, '');

        // Check dist/client/images first (production: images copied there by webpack)
        const distFilePath = distImagesRoot ? path.join(distImagesRoot, relativePath) : null;
        if (distFilePath && fs.existsSync(distFilePath)) {
            res.setHeader('Content-Type', 'image/webp');
            return res.sendFile(distFilePath);
        }

        // Fallback to client/public/images (development)
        const publicFilePath = path.join(publicImagesRoot, relativePath);
        if (fs.existsSync(publicFilePath)) {
            res.setHeader('Content-Type', 'image/webp');
            return res.sendFile(publicFilePath);
        }

        next();
    };
}

module.exports = optimizedImageFallback;
