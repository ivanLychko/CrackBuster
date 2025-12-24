const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  metaTitle: {
    type: String,
  },
  metaDescription: {
    type: String,
  },
  keywords: [String],
  // Extended SEO fields
  seoTitle: {
    type: String,
  },
  seoDescription: {
    type: String,
  },
  seoKeywords: {
    type: String,
  },
  ogTitle: {
    type: String,
  },
  ogDescription: {
    type: String,
  },
  ogImage: {
    type: String,
  },
  twitterTitle: {
    type: String,
  },
  twitterDescription: {
    type: String,
  },
  twitterImage: {
    type: String,
  },
  canonicalUrl: {
    type: String,
  },
  robots: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  faq: [{
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

serviceSchema.index({ featured: 1 });

module.exports = mongoose.model('Service', serviceSchema);

