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

  // Review images (from plugin JSON: array of URLs)
  images: {
    type: [String],
    default: []
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

// Get active reviews with pagination
googleReviewSchema.statics.getActiveReviewsPaginated = async function(page = 1, perPage = 9) {
  const skip = (Math.max(1, page) - 1) * perPage;
  const [reviews, totalCount] = await Promise.all([
    this.find({ active: true }).sort({ reviewTime: -1 }).skip(skip).limit(perPage).lean(),
    this.countDocuments({ active: true })
  ]);
  return { reviews, totalCount };
};

// Get average rating and total count for active reviews
googleReviewSchema.statics.getActiveStats = async function() {
  const agg = await this.aggregate([
    { $match: { active: true } },
    { $group: { _id: null, averageRating: { $avg: '$rating' }, totalCount: { $sum: 1 } } }
  ]);
  if (!agg.length) return { averageRating: 0, totalCount: 0 };
  return {
    averageRating: Math.round(agg[0].averageRating * 100) / 100,
    totalCount: agg[0].totalCount
  };
};

module.exports = mongoose.model('GoogleReview', googleReviewSchema);

