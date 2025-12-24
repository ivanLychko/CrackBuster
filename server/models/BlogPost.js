const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  excerpt: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  featuredImage: {
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
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

blogPostSchema.index({ published: 1, publishedAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);

