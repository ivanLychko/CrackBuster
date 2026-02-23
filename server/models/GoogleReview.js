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

// Build filter and sort from display options
// options: { minStars?, maxStars?, hideEmptyReviews?, sortBy? }
function buildFilterAndSort(options = {}) {
  const match = { active: true };
  if (options.minStars != null && options.minStars >= 1) {
    match.rating = match.rating || {};
    match.rating.$gte = options.minStars;
  }
  if (options.maxStars != null && options.maxStars <= 5) {
    match.rating = match.rating || {};
    match.rating.$lte = options.maxStars;
  }
  if (options.hideEmptyReviews) {
    match.text = { $regex: /\S/ };
  }
  const sortBy = options.sortBy || 'newest_first';
  let sort = {};
  switch (sortBy) {
    case 'oldest_first':
      sort = { reviewTime: 1 };
      break;
    case 'highest_rating':
      sort = { rating: -1, reviewTime: -1 };
      break;
    case 'lowest_rating':
      sort = { rating: 1, reviewTime: -1 };
      break;
    default:
      sort = { reviewTime: -1 };
  }
  return { match, sort };
}

// Get active reviews with pagination (legacy — no filter options)
googleReviewSchema.statics.getActiveReviewsPaginated = async function(page = 1, perPage = 9, options = {}) {
  const { match, sort } = buildFilterAndSort(options);
  const skip = (Math.max(1, page) - 1) * perPage;
  const [reviews, totalCount] = await Promise.all([
    this.find(match).sort(sort).skip(skip).limit(perPage).lean(),
    this.countDocuments(match)
  ]);
  return { reviews, totalCount };
};

// Get average rating and total count for active reviews (with same filter options)
googleReviewSchema.statics.getActiveStats = async function(options = {}) {
  const { match } = buildFilterAndSort(options);
  const agg = await this.aggregate([
    { $match: match },
    { $group: { _id: null, averageRating: { $avg: '$rating' }, totalCount: { $sum: 1 } } }
  ]);
  if (!agg.length) return { averageRating: 0, totalCount: 0 };
  return {
    averageRating: Math.round(agg[0].averageRating * 100) / 100,
    totalCount: agg[0].totalCount
  };
};

module.exports = mongoose.model('GoogleReview', googleReviewSchema);

