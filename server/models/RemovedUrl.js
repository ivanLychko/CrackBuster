const mongoose = require('mongoose');

const removedUrlSchema = new mongoose.Schema({
  // URL path that should return 410
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Normalize URL: remove leading/trailing slashes, convert to lowercase
    set: function(value) {
      if (!value) return value;
      // Remove leading and trailing slashes, but keep internal slashes
      let normalized = value.trim().replace(/^\/+|\/+$/g, '');
      // Add leading slash for consistency
      return normalized ? '/' + normalized : '/';
    }
  },
  
  // Optional: reason for removal
  reason: {
    type: String,
    default: ''
  },
  
  // Optional: date when URL was removed
  removedAt: {
    type: Date,
    default: Date.now
  },
  
  // Optional: notes
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Note: Index on 'url' is automatically created by unique: true above
// No need to define it explicitly

// Static method to check if URL is removed
removedUrlSchema.statics.isRemoved = async function(urlPath) {
  if (!urlPath) return false;
  
  // Normalize the URL path
  let normalized = urlPath.trim().replace(/^\/+|\/+$/g, '');
  normalized = normalized ? '/' + normalized : '/';
  
  // Check exact match
  const exactMatch = await this.findOne({ url: normalized });
  if (exactMatch) return exactMatch;
  
  // Check if URL starts with any removed URL (for sub-paths)
  // For example, if /old-page is removed, /old-page/sub should also return 410
  const allRemoved = await this.find({});
  for (const removed of allRemoved) {
    if (normalized.startsWith(removed.url)) {
      return removed;
    }
  }
  
  return false;
};

module.exports = mongoose.model('RemovedUrl', removedUrlSchema);

