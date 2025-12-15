require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { HelmetProvider } = require('react-helmet-async');

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
app.use(express.static(path.join(__dirname, '../dist/client')));

// Serve static files from public folder (images, etc.)
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));
app.use(express.static(path.join(__dirname, '../client/public')));

// API routes
app.use('/api', require('./routes/api'));

// Admin routes (protected with HTTP Basic Auth)
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/images', require('./routes/images'));

// SEO routes
app.use('/', require('./routes/sitemap'));
app.use('/', require('./routes/robots'));

// SSR function
const renderApp = (req, res, AppComponent) => {
    const helmetContext = {};
    const html = ReactDOMServer.renderToString(
        React.createElement(
            HelmetProvider,
            { context: helmetContext },
            React.createElement(AppComponent, { location: req.url })
        )
    );

    const { helmet } = helmetContext;
    const helmetHtml = helmet ? helmet.toString() : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${helmetHtml}
        <link rel="stylesheet" href="/bundle.[contenthash].css">
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="/bundle.[contenthash].js"></script>
      </body>
    </html>
  `;
};

// SSR route handler - catch all routes except static files
app.get('*', async (req, res) => {
    // Skip static file requests (they should be handled by express.static above)
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|eot|ttf|otf|mp4)$/)) {
        return res.status(404).send('File not found');
    }

    // Check if request is from a bot/crawler
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver/i.test(userAgent);

    // In production, always serve static HTML (pre-rendered or client-side)
    // For bots, we rely on proper meta tags and structured data in the static HTML
    // The React app will hydrate on the client side
    const indexPath = path.join(__dirname, '../dist/client/index.html');

    if (isBot && process.env.NODE_ENV === 'production') {
        // For bots in production, try SSR if available, otherwise serve static
        try {
            // Try to load compiled server bundle for SSR
            const serverBundle = path.join(__dirname, 'server.js');
            if (require('fs').existsSync(serverBundle)) {
                // SSR would be handled by compiled server bundle
                // For now, serve static HTML with proper meta tags
                res.sendFile(indexPath);
            } else {
                res.sendFile(indexPath);
            }
        } catch (error) {
            console.error('SSR Error:', error);
            res.sendFile(indexPath);
        }
    } else {
        // Serve static HTML for all users
        // React will hydrate on the client side
        res.sendFile(indexPath);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

