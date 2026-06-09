const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Brand name must be at least 2 characters'],
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create slug from name before saving
brandSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

// Case-insensitive unique validation
brandSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('name')) {
    const existingBrand = await this.constructor.findOne({
      name: { $regex: new RegExp(`^${this.name}$`, 'i') }
    });
    
    if (existingBrand && existingBrand._id.toString() !== this._id.toString()) {
      const error = new Error('Brand name already exists');
      error.code = 'DUPLICATE_BRAND';
      return next(error);
    }
  }
  next();
});

// Create index for case-insensitive search
brandSchema.index({ name: 1 });

module.exports = mongoose.model('Brand', brandSchema);
