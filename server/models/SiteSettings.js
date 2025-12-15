const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  // Contact Information
  phone: {
    type: String,
    default: '(780) XXX-XXXX'
  },
  email: {
    type: String,
    default: 'info@crackbuster.ca'
  },
  address: {
    type: String,
    default: 'Edmonton, Alberta, Canada'
  },
  serviceArea: {
    type: String,
    default: 'Edmonton and surrounding areas'
  },

  // Social Media Links
  facebook: {
    type: String,
    default: ''
  },
  instagram: {
    type: String,
    default: ''
  },
  twitter: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  youtube: {
    type: String,
    default: ''
  },

  // Business Hours (optional)
  businessHours: {
    type: String,
    default: ''
  },

  // Additional contact info
  secondaryPhone: {
    type: String,
    default: ''
  },
  secondaryEmail: {
    type: String,
    default: ''
  },

  // SEO Settings
  allowIndexing: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);




