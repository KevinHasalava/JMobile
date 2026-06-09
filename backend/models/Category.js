const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
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
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

// Case-insensitive unique validation
categorySchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('name')) {
    const existingCategory = await this.constructor.findOne({
      name: { $regex: new RegExp(`^${this.name}$`, 'i') }
    });
    
    if (existingCategory && existingCategory._id.toString() !== this._id.toString()) {
      const error = new Error('Category name already exists');
      error.code = 'DUPLICATE_CATEGORY';
      return next(error);
    }
  }
  next();
});

// Create index for case-insensitive search
categorySchema.index({ name: 1 });

module.exports = mongoose.model('Category', categorySchema);
