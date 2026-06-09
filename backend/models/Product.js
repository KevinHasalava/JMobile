const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand name'],
    trim: true,
    index: true  // Index for fast brand filtering
  },
  model: {
    type: String,
    required: false,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0,
    index: true  // Index for price range queries
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  specifications: {
    display: String,
    processor: String,
    ram: String,
    storage: String,
    camera: String,
    battery: String,
    os: String,
    color: [String]
  },
  images: [{
    type: String
  }],
  image: {
    type: String
  },
  video: {
    type: String
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    index: true  // Index for category filtering
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false,
    index: true  // Index for featured products
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
    index: true  // Index for rating sorting
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true  // Index for sorting by creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for common search patterns
productSchema.index({ category: 1, brand: 1, price: 1 });
productSchema.index({ featured: 1, createdAt: -1 });
productSchema.index({ name: 'text', brand: 'text', description: 'text' });  // Full-text search index

// Update the updatedAt timestamp before saving
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
