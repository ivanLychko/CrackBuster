const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
  // Page identifier (home, about-us, contact-us, get-estimate, our-works, blog, services, blog-post, service-detail, 404)
  page: {
    type: String,
    required: true,
    unique: true,
    enum: ['home', 'about-us', 'contact-us', 'get-estimate', 'our-works', 'blog', 'blog-post', 'service-detail', 'services', '404']
  },
  
  // Basic SEO
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  keywords: {
    type: String,
    default: ''
  },
  
  // Open Graph
  ogTitle: {
    type: String,
    default: ''
  },
  ogDescription: {
    type: String,
    default: ''
  },
  ogImage: {
    type: String,
    default: ''
  },
  
  // Twitter Card
  twitterTitle: {
    type: String,
    default: ''
  },
  twitterDescription: {
    type: String,
    default: ''
  },
  twitterImage: {
    type: String,
    default: ''
  },
  
  // Canonical URL (optional, usually auto-generated)
  canonicalUrl: {
    type: String,
    default: ''
  },
  
  // Robots meta tag (optional, can override global setting)
  robots: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure only one SEO document per page
seoSchema.statics.getSEO = async function (page) {
  let seo = await this.findOne({ page });
  if (!seo) {
    seo = await this.create({ page });
  }
  return seo;
};

// Get all SEO data
seoSchema.statics.getAllSEO = async function () {
  return await this.find({}).sort({ page: 1 });
};

module.exports = mongoose.model('SEO', seoSchema);



