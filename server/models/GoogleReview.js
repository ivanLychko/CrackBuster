const mongoose = require('mongoose');

const googleReviewSchema = new mongoose.Schema({
  // Google review ID (if available)
  reviewId: {
    type: String,
    default: ''
  },
  
  // Author information
  authorName: {
    type: String,
    required: true
  },
  authorPhoto: {
    type: String,
    default: ''
  },
  authorUrl: {
    type: String,
    default: ''
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    default: ''
  },
  
  // Timestamps
  reviewTime: {
    type: Date,
    default: Date.now
  },
  
  // Original data from Google (for reference)
  originalData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Sync information
  lastSynced: {
    type: Date,
    default: Date.now
  },
  
  // Whether this review is active/visible
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
googleReviewSchema.index({ active: 1, reviewTime: -1 });
googleReviewSchema.index({ reviewId: 1 });

// Get active reviews sorted by date
googleReviewSchema.statics.getActiveReviews = async function(limit = 10) {
  return await this.find({ active: true })
    .sort({ reviewTime: -1 })
    .limit(limit);
};

// Get all reviews
googleReviewSchema.statics.getAllReviews = async function() {
  return await this.find({}).sort({ reviewTime: -1 });
};

module.exports = mongoose.model('GoogleReview', googleReviewSchema);

