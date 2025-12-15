const express = require('express');
const router = express.Router();

router.get('/robots.txt', (req, res) => {
  const baseUrl = req.protocol + '://' + req.get('host');
  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.type('text/plain');
  res.send(robots);
});

module.exports = router;




