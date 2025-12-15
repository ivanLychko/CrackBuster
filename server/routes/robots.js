const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');

router.get('/robots.txt', async (req, res) => {
  try {
    const baseUrl = req.protocol + '://' + req.get('host');
    const settings = await SiteSettings.getSettings();

    let robots;
    if (settings.allowIndexing === false) {
      // Disallow all indexing
      robots = `User-agent: *
Disallow: /
`;
    } else {
      // Allow indexing
      robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
    }

    res.type('text/plain');
    res.send(robots);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    // Fallback to allowing indexing on error
    const baseUrl = req.protocol + '://' + req.get('host');
    const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.type('text/plain');
    res.send(robots);
  }
});

module.exports = router;




