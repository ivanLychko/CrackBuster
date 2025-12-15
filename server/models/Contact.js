const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['contact', 'estimate'],
    default: 'contact',
  },
  address: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'completed'],
    default: 'new',
  },
  images: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });

module.exports = mongoose.model('Contact', contactSchema);

