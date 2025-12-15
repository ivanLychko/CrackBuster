const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const Service = require('../models/Service');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = req.protocol + '://' + req.get('host');
    const now = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

    const urls = [
      { loc: baseUrl, changefreq: 'daily', priority: '1.0', lastmod: now },
      { loc: `${baseUrl}/about-us`, changefreq: 'monthly', priority: '0.8', lastmod: now },
      { loc: `${baseUrl}/services`, changefreq: 'weekly', priority: '0.9', lastmod: now },
      { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: '0.8', lastmod: now },
      { loc: `${baseUrl}/our-works`, changefreq: 'weekly', priority: '0.7', lastmod: now },
      { loc: `${baseUrl}/get-estimate`, changefreq: 'monthly', priority: '0.8', lastmod: now },
      { loc: `${baseUrl}/contact-us`, changefreq: 'monthly', priority: '0.7', lastmod: now },
    ];

    // Add service pages
    try {
      const services = await Service.find({});
      services.forEach(service => {
        const serviceLastmod = service.updatedAt
          ? new Date(service.updatedAt).toISOString().split('T')[0]
          : service.createdAt
            ? new Date(service.createdAt).toISOString().split('T')[0]
            : now;
        urls.push({
          loc: `${baseUrl}/services/${service.slug}`,
          changefreq: 'monthly',
          priority: '0.8',
          lastmod: serviceLastmod
        });
      });
    } catch (error) {
      console.error('Error fetching services for sitemap:', error);
    }

    // Add blog posts
    try {
      const posts = await BlogPost.find({ published: true });
      posts.forEach(post => {
        const postLastmod = post.updatedAt
          ? new Date(post.updatedAt).toISOString().split('T')[0]
          : post.publishedAt
            ? new Date(post.publishedAt).toISOString().split('T')[0]
            : now;
        urls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          changefreq: 'monthly',
          priority: '0.7',
          lastmod: postLastmod
        });
      });
    } catch (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;




