const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [String],
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },
  location: {
    type: String,
  },
  completedAt: {
    type: Date,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

workSchema.index({ featured: 1 });
workSchema.index({ completedAt: -1 });

module.exports = mongoose.model('Work', workSchema);






