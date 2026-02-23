const mongoose = require('mongoose');

const googleReviewSettingsSchema = new mongoose.Schema({
  // URL that returns JSON: { place, reviews[] } (e.g. external review service)
  reviewsFeedUrl: {
    type: String,
    default: '',
    required: false
  },

  // Google Place ID — for "Write a review" link: https://search.google.com/local/writereview?placeid=...
  googlePlaceId: {
    type: String,
    default: '',
    trim: true
  },

  // Custom "Write a review" URL (if set, used instead of generated from googlePlaceId)
  writeReviewUrlOverride: {
    type: String,
    default: '',
    trim: true
  },

  // Whether to show reviews on homepage
  enabled: {
    type: Boolean,
    default: false
  },

  // Number of reviews per page on homepage
  displayCount: {
    type: Number,
    default: 5,
    min: 1,
    max: 20
  },

  // Minimum star rating to show (1-5). Only reviews with rating >= this are shown.
  minStars: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },

  // Maximum star rating to show (1-5). Only reviews with rating <= this are shown. Use 5 to show all.
  maxStars: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },

  // Hide reviews that have no text (only rating)
  hideEmptyReviews: {
    type: Boolean,
    default: false
  },

  // Sort order: newest_first | oldest_first | highest_rating | lowest_rating
  sortBy: {
    type: String,
    enum: ['newest_first', 'oldest_first', 'highest_rating', 'lowest_rating'],
    default: 'newest_first'
  },

  // Last sync timestamp
  lastSynced: {
    type: Date,
    default: null
  },

  // Sync status
  syncStatus: {
    type: String,
    enum: ['idle', 'syncing', 'success', 'error'],
    default: 'idle'
  },

  // Last sync error message
  lastSyncError: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
googleReviewSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Update settings
googleReviewSettingsSchema.statics.updateSettings = async function(data) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(data);
  } else {
    Object.assign(settings, data);
    await settings.save();
  }
  return settings;
};

// Generate "Write a review" URL: use override if set, else build from googlePlaceId
googleReviewSettingsSchema.statics.getWriteReviewUrl = function(settings) {
  const override = (settings && settings.writeReviewUrlOverride) ? settings.writeReviewUrlOverride.trim() : '';
  if (override) return override;
  const placeId = (settings && settings.googlePlaceId) ? settings.googlePlaceId.trim() : '';
  if (!placeId) return '';
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
};

module.exports = mongoose.model('GoogleReviewSettings', googleReviewSettingsSchema);

