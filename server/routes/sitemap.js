const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const Service = require('../models/Service');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = req.protocol + '://' + req.get('host');
    const urls = [
      { loc: baseUrl, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/about-us`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${baseUrl}/services`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${baseUrl}/our-works`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${baseUrl}/get-estimate`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${baseUrl}/contact-us`, changefreq: 'monthly', priority: '0.7' },
    ];

    // Add service pages
    try {
      const services = await Service.find({});
      services.forEach(service => {
        urls.push({
          loc: `${baseUrl}/services/${service.slug}`,
          changefreq: 'monthly',
          priority: '0.8'
        });
      });
    } catch (error) {
      console.error('Error fetching services for sitemap:', error);
    }

    // Add blog posts
    try {
      const posts = await BlogPost.find({ published: true });
      posts.forEach(post => {
        urls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          changefreq: 'monthly',
          priority: '0.7'
        });
      });
    } catch (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
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




