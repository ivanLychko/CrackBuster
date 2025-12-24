const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const Service = require('../models/Service');

/**
 * Static routes configuration
 * This array defines all static pages that should be included in the sitemap.
 * To add a new static page, simply add an entry here.
 */
const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about-us', changefreq: 'monthly', priority: '0.8' },
  { path: '/services', changefreq: 'weekly', priority: '0.9' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/our-works', changefreq: 'weekly', priority: '0.7' },
  { path: '/get-estimate', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact-us', changefreq: 'monthly', priority: '0.7' },
];

/**
 * Format date to YYYY-MM-DD format for sitemap
 */
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Get the most recent modification date from multiple date fields
 */
const getLastModDate = (item, dateFields = ['updatedAt', 'createdAt', 'publishedAt']) => {
  for (const field of dateFields) {
    if (item[field]) {
      return formatDate(item[field]);
    }
  }
  return null;
};

/**
 * Fetch all dynamic service pages from database
 */
const getServicePages = async (baseUrl, defaultDate) => {
  try {
    const services = await Service.find({}).lean();
    return services.map(service => ({
      loc: `${baseUrl}/services/${service.slug}`,
      changefreq: 'monthly',
      priority: '0.8',
      lastmod: getLastModDate(service, ['updatedAt', 'createdAt']) || defaultDate
    }));
  } catch (error) {
    console.error('Error fetching services for sitemap:', error);
    return [];
  }
};

/**
 * Fetch all published blog posts from database
 */
const getBlogPostPages = async (baseUrl, defaultDate) => {
  try {
    const posts = await BlogPost.find({ published: true }).lean();
    return posts.map(post => ({
      loc: `${baseUrl}/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: getLastModDate(post, ['updatedAt', 'publishedAt', 'createdAt']) || defaultDate
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
};

/**
 * Generate sitemap XML from URL entries
 */
const generateSitemapXML = (urls) => {
  const urlEntries = urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

/**
 * Main sitemap generation route
 * Automatically generates sitemap based on:
 * 1. Static routes defined in STATIC_ROUTES
 * 2. Dynamic service pages from database
 * 3. Published blog posts from database
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = req.protocol + '://' + req.get('host');
    const now = formatDate(new Date());

    // Start with static routes
    const urls = STATIC_ROUTES.map(route => ({
      loc: `${baseUrl}${route.path}`,
      changefreq: route.changefreq,
      priority: route.priority,
      lastmod: now
    }));

    // Add dynamic pages from database
    const [servicePages, blogPostPages] = await Promise.all([
      getServicePages(baseUrl, now),
      getBlogPostPages(baseUrl, now)
    ]);

    urls.push(...servicePages, ...blogPostPages);

    // Sort URLs by priority (highest first), then by path
    urls.sort((a, b) => {
      const priorityDiff = parseFloat(b.priority) - parseFloat(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return a.loc.localeCompare(b.loc);
    });

    const sitemap = generateSitemapXML(urls);

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;




