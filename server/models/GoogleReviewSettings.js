const mongoose = require('mongoose');

const googleReviewSettingsSchema = new mongoose.Schema({
  // Google Place ID (required for fetching reviews)
  placeId: {
    type: String,
    default: '',
    required: false
  },
  
  // Google API Key (optional, for official API)
  apiKey: {
    type: String,
    default: '',
    required: false
  },
  
  // Whether to show reviews on homepage
  enabled: {
    type: Boolean,
    default: false
  },
  
  // Number of reviews to display
  displayCount: {
    type: Number,
    default: 5,
    min: 1,
    max: 20
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

module.exports = mongoose.model('GoogleReviewSettings', googleReviewSettingsSchema);

