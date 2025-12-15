require('dotenv').config();

// Register Babel for JSX/ES6 transpilation in development
// In production, webpack handles this during build
if (process.env.NODE_ENV !== 'production') {
    // Add handlers for static files before babel-register
    // This allows require() to work with images and other static assets
    const Module = require('module');
    const path = require('path');
    const fs = require('fs');

    // List of static file extensions to handle
    const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.eot', '.ttf', '.otf', '.mp4', '.css', '.scss', '.sass'];

    // Register handlers for static file extensions
    staticExtensions.forEach(ext => {
        if (!Module._extensions[ext]) {
            Module._extensions[ext] = function (module, filename) {
                // Return the resolved path to the file as a string
                // This mimics what webpack does - returns the path as a string
                const resolvedPath = path.resolve(filename);
                module.exports = resolvedPath;
            };
        }
    });

    require('@babel/register')({
        extensions: ['.js', '.jsx'],
        ignore: [
            /node_modules/,
            // Ignore image and other static files
            /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|eot|ttf|otf|mp4|css|scss|sass)$/,
        ],
        // .babelrc will be used automatically
    });
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { StaticRouter } = require('react-router-dom/server');
const { HelmetProvider } = require('react-helmet-async');

// Determine project root directory
// When running from dist/server/server.js, __dirname is dist/server
// When running from server/index.js, __dirname is server
// We need to find the project root (where package.json is located)
function getProjectRoot() {
    let currentDir = path.resolve(__dirname);
    const normalizedCurrentDir = currentDir.replace(/\\/g, '/'); // Normalize path separators

    // If we're in dist/server, go up two levels
    if (normalizedCurrentDir.endsWith('/dist/server') || normalizedCurrentDir.endsWith('\\dist\\server')) {
        const root = path.resolve(currentDir, '../..');
        console.log('Detected dist/server, going up two levels to:', root);
        return root;
    }

    // If we're in server, go up one level
    if (normalizedCurrentDir.endsWith('/server') || normalizedCurrentDir.endsWith('\\server')) {
        // Check if parent has package.json (we're in source server directory)
        const parent = path.resolve(currentDir, '..');
        if (fs.existsSync(path.join(parent, 'package.json'))) {
            console.log('Detected server directory, going up one level to:', parent);
            return parent;
        }
    }

    // Try to find package.json by going up directories
    let dir = currentDir;
    let lastDir = '';
    while (dir !== lastDir) {
        const packageJsonPath = path.join(dir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            console.log('Found package.json at:', dir);
            return dir;
        }
        lastDir = dir;
        dir = path.dirname(dir);
    }

    // Fallback: use process.cwd() if available (working directory)
    if (process.cwd && fs.existsSync(path.join(process.cwd(), 'package.json'))) {
        console.log('Using process.cwd() as project root:', process.cwd());
        return process.cwd();
    }

    // Last fallback to parent directory
    const fallback = path.resolve(currentDir, '..');
    console.log('Using fallback parent directory:', fallback);
    return fallback;
}

const PROJECT_ROOT = getProjectRoot();

// Log project root for debugging
const distClientPath = path.join(PROJECT_ROOT, 'dist/client');
const distClientExists = fs.existsSync(distClientPath);

console.log('=== Server Startup Debug Info ===');
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());
console.log('PROJECT_ROOT:', PROJECT_ROOT);
console.log('dist/client path:', distClientPath);
console.log('dist/client exists:', distClientExists);

if (!distClientExists) {
    console.error('ERROR: dist/client directory not found!');
    console.error('Please run: npm run build');
    // List what's in PROJECT_ROOT to help debug
    if (fs.existsSync(PROJECT_ROOT)) {
        console.log('Contents of PROJECT_ROOT:', fs.readdirSync(PROJECT_ROOT).join(', '));
    }
}
console.log('================================');

// Import App component and ServerDataProvider - webpack will bundle it when building server bundle
// This must be a static require (not in try-catch) so webpack can include it in the bundle
const App = require('../client/src/App').default;
const { ServerDataProvider } = require('../client/src/contexts/ServerDataContext');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crackbuster')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/client (built files) - MUST be before catch-all route
// This includes bundle files, images copied by webpack, etc.
app.use(express.static(distClientPath, {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true
}));

// Serve static files from public folder (images, etc.) as fallback
// This ensures images are available even if not copied to dist
const publicImagesPath = path.join(PROJECT_ROOT, 'client/public/images');
app.use('/images', express.static(publicImagesPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true
}));
const publicPath = path.join(PROJECT_ROOT, 'client/public');
app.use(express.static(publicPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true
}));

// API routes
app.use('/api', require('./routes/api'));

// Admin routes (protected with HTTP Basic Auth)
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/images', require('./routes/images'));

// SEO routes
app.use('/', require('./routes/sitemap'));
app.use('/', require('./routes/robots'));

// Helper function to find bundle files
const findBundleFiles = () => {
    const distPath = path.join(PROJECT_ROOT, 'dist/client');

    // Check if dist directory exists
    if (!fs.existsSync(distPath)) {
        console.warn('Warning: dist/client directory not found');
        return { jsBundle: 'bundle.js', cssBundle: null };
    }

    const files = fs.readdirSync(distPath);

    let jsBundle = 'bundle.js';
    let cssBundle = null;

    // Find JS bundle - must end with .js and not be a LICENSE file
    const jsFiles = files.filter(f =>
        f.startsWith('bundle.') &&
        f.endsWith('.js') &&
        !f.includes('.LICENSE') &&
        !f.endsWith('.js.LICENSE.txt')
    );
    if (jsFiles.length > 0) {
        jsBundle = jsFiles[0];
    }

    // Find CSS bundle - must end with .css
    const cssFiles = files.filter(f =>
        f.startsWith('bundle.') &&
        f.endsWith('.css') &&
        !f.endsWith('.js') // Extra check to ensure it's not a JS file
    );
    if (cssFiles.length > 0) {
        cssBundle = cssFiles[0];
    }

    return { jsBundle, cssBundle };
};

// SSR function
const renderApp = async (req) => {
    const helmetContext = {};

    // Load data on server before rendering
    const SiteSettings = require('./models/SiteSettings');
    const Service = require('./models/Service');

    let siteSettings = null;
    try {
        siteSettings = await SiteSettings.getSettings();
        // Convert mongoose document to plain object
        siteSettings = siteSettings.toObject ? siteSettings.toObject() : siteSettings;
    } catch (error) {
        console.error('Error loading site settings for SSR:', error);
        // Use default settings
        siteSettings = {
            phone: '(780) XXX-XXXX',
            email: 'info@crackbuster.ca',
            address: 'Edmonton, Alberta, Canada',
            serviceArea: 'Edmonton and surrounding areas',
            secondaryPhone: '',
            secondaryEmail: '',
            businessHours: '',
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            youtube: '',
            allowIndexing: true
        };
    }

    // Load services for home page
    let services = [];
    if (req.url === '/' || req.url === '') {
        try {
            const servicesData = await Service.find({}).lean();
            // Get featured services or first 3
            const featuredServices = servicesData.filter(s => s.featured).slice(0, 3);
            services = featuredServices.length >= 3 ? featuredServices : servicesData.slice(0, 3);
        } catch (error) {
            console.error('Error loading services for SSR:', error);
            services = [];
        }
    }

    // StaticRouter expects the URL string
    const location = req.url;

    // Prepare server data for components
    const serverData = {
        siteSettings: siteSettings,
        services: services
    };

    let html = '';
    try {
        html = ReactDOMServer.renderToString(
            React.createElement(
                HelmetProvider,
                { context: helmetContext },
                React.createElement(
                    StaticRouter,
                    { location },
                    React.createElement(
                        ServerDataProvider,
                        { data: serverData },
                        React.createElement(App)
                    )
                )
            )
        );

        // Log if HTML is empty (for debugging)
        if (!html || html.trim().length === 0) {
            console.warn('Warning: SSR rendered empty HTML for URL:', location);
        }
    } catch (error) {
        console.error('Error during SSR render:', error);
        console.error('Stack:', error.stack);
        // Return empty HTML on error - client will hydrate
        html = '';
    }

    const { helmet } = helmetContext;

    // Extract HTML from helmet - react-helmet-async provides toComponent() methods
    let helmetHtml = '';
    if (helmet) {
        // Use ReactDOMServer to render helmet components to HTML strings
        const parts = [];

        try {
            if (helmet.title && typeof helmet.title.toComponent === 'function') {
                const titleComponent = helmet.title.toComponent();
                parts.push(ReactDOMServer.renderToStaticMarkup(titleComponent));
            }
            if (helmet.meta && typeof helmet.meta.toComponent === 'function') {
                const metaComponent = helmet.meta.toComponent();
                parts.push(ReactDOMServer.renderToStaticMarkup(metaComponent));
            }
            if (helmet.link && typeof helmet.link.toComponent === 'function') {
                const linkComponent = helmet.link.toComponent();
                parts.push(ReactDOMServer.renderToStaticMarkup(linkComponent));
            }
            if (helmet.script && typeof helmet.script.toComponent === 'function') {
                const scriptComponent = helmet.script.toComponent();
                parts.push(ReactDOMServer.renderToStaticMarkup(scriptComponent));
            }
            if (helmet.style && typeof helmet.style.toComponent === 'function') {
                const styleComponent = helmet.style.toComponent();
                parts.push(ReactDOMServer.renderToStaticMarkup(styleComponent));
            }
            if (helmet.noscript && typeof helmet.noscript.toComponent === 'function') {
                const noscriptComponent = helmet.noscript.toComponent();
                parts.push(ReactDOMServer.renderToStaticMarkup(noscriptComponent));
            }
            if (helmet.base && typeof helmet.base.toComponent === 'function') {
                const baseComponent = helmet.base.toComponent();
                parts.push(ReactDOMServer.renderToStaticMarkup(baseComponent));
            }
        } catch (error) {
            console.error('Error rendering helmet components:', error);
        }

        helmetHtml = parts.join('\n        ');
    }

    // Find bundle files
    const { jsBundle, cssBundle } = findBundleFiles();

    // Get HTML attributes from helmet
    let htmlAttrs = {};
    if (helmet && helmet.htmlAttributes) {
        const htmlAttrsComponent = helmet.htmlAttributes.toComponent();
        htmlAttrs = htmlAttrsComponent || {};
    }
    const htmlAttrsString = Object.keys(htmlAttrs)
        .filter(key => htmlAttrs[key] !== undefined && htmlAttrs[key] !== null)
        .map(key => {
            const value = htmlAttrs[key];
            // Handle boolean attributes
            if (value === true) return key;
            return `${key}="${String(value).replace(/"/g, '&quot;')}"`;
        })
        .join(' ');
    const htmlTag = htmlAttrsString ? `<html ${htmlAttrsString}>` : '<html lang="en">';

    // Get body attributes from helmet
    let bodyAttrs = {};
    if (helmet && helmet.bodyAttributes) {
        const bodyAttrsComponent = helmet.bodyAttributes.toComponent();
        bodyAttrs = bodyAttrsComponent || {};
    }
    const bodyAttrsString = Object.keys(bodyAttrs)
        .filter(key => bodyAttrs[key] !== undefined && bodyAttrs[key] !== null)
        .map(key => {
            const value = bodyAttrs[key];
            // Handle boolean attributes
            if (value === true) return key;
            return `${key}="${String(value).replace(/"/g, '&quot;')}"`;
        })
        .join(' ');
    const bodyTag = bodyAttrsString ? `<body ${bodyAttrsString}>` : '<body>';

    // Embed initial data in HTML for client-side hydration
    const initialData = {
        siteSettings: siteSettings,
        services: services
    };

    return `
    <!DOCTYPE html>
    ${htmlTag}
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${helmetHtml}
        ${cssBundle ? `<link rel="stylesheet" href="/${cssBundle}">` : ''}
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialData)};
        </script>
      </head>
      ${bodyTag}
        <div id="root">${html}</div>
        <script src="/${jsBundle}"></script>
      </body>
    </html>
  `;
};

// SSR route handler - catch all routes except static files
// Note: express.static middleware above should handle all static file requests
// This route only handles HTML page requests
app.get('*', async (req, res, next) => {
    // Skip static file requests - they should be handled by express.static above
    // If we reach here for a static file, it means express.static didn't find it
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|eot|ttf|otf|mp4)$/)) {
        // Try to find the file in dist/client first
        const distPath = path.join(PROJECT_ROOT, 'dist/client', req.path);
        if (fs.existsSync(distPath)) {
            return res.sendFile(distPath);
        }
        // Try to find in public/images for image requests
        if (req.path.startsWith('/images/')) {
            const publicPath = path.join(PROJECT_ROOT, 'client/public', req.path);
            if (fs.existsSync(publicPath)) {
                return res.sendFile(publicPath);
            }
        }
        // File not found
        return res.status(404).send('File not found');
    }

    // Check if request is from a bot/crawler or curl
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver|curl|wget|postman|insomnia/i.test(userAgent);

    // Check if Accept header suggests HTML is expected (not API request)
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    // Always use SSR for bots/crawlers/curl, and optionally for all requests
    // This ensures SEO markup is always present for search engines
    // For regular browsers, we can serve static HTML and let React hydrate
    const shouldUseSSR = isBot || process.env.ENABLE_SSR === 'true' || (process.env.NODE_ENV === 'production' && acceptsHtml);

    if (shouldUseSSR) {
        try {
            const html = await renderApp(req);
            res.send(html);
        } catch (error) {
            console.error('SSR Error:', error);
            // Fallback to static HTML if SSR fails
            const indexPath = path.join(PROJECT_ROOT, 'dist/client/index.html');
            if (fs.existsSync(indexPath)) {
                res.sendFile(indexPath);
            } else {
                res.status(500).send('Server error: SSR failed and no static HTML found');
            }
        }
    } else {
        // For regular users, serve static HTML (React will hydrate on client)
        const indexPath = path.join(PROJECT_ROOT, 'dist/client/index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            // If no static HTML, try SSR as fallback
            try {
                const html = await renderApp(req);
                res.send(html);
            } catch (error) {
                console.error('SSR Error:', error);
                res.status(500).send('Server error: Unable to serve page');
            }
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

