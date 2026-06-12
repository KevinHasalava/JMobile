const Product = require('../models/Product');

// Fields to return in product list (exclude heavy fields)
const PRODUCT_LIST_FIELDS = 'name brand price originalPrice rating numReviews category stock featured image images _id';
const PRODUCT_DETAIL_FIELDS = null; // Return all fields for single product

// @desc    Get all products with pagination, filtering, and sorting
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      search,
      brand,
      minPrice,
      maxPrice,
      category,
      featured,
      sortBy = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    // Build query filter object
    let query = {};

    // Search by name, brand, or model using text search for better performance
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: brand || search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    } else {
      // Apply individual filters only if no search is active
      if (brand) {
        query.brand = brand; // Use exact match for performance
      }

      if (category && category !== 'all') {
        query.category = category;
      }

      if (featured === 'true') {
        query.featured = true;
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Get total count for pagination (without limit/skip)
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    console.log(`📦 Query: ${JSON.stringify(query)} | Page: ${page} | Limit: ${limit}`);

    // Execute optimized query
    const products = await Product.find(query)
      .select(PRODUCT_LIST_FIELDS)
      .sort(sortBy)
      .limit(limit)
      .skip(skip)
      .lean() // Returns plain JS objects instead of Mongoose documents (30% faster)
      .exec();

    console.log(`✅ Retrieved ${products.length} products (Total: ${totalProducts})`);

    // Prevent CDN caching to ensure real-time inventory updates
    res.set('Cache-Control', 'no-store');

    res.status(200).json({
      success: true,
      count: products.length,
      total: totalProducts,
      page: Number(page),
      pages: totalPages,
      hasMore: page < totalPages,
      data: products
    });
  } catch (error) {
    console.error('❌ Database error in getProducts:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single product with full details
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    console.log(`🔍 Fetching product with ID: ${id}`);

    const product = await Product.findById(id)
      .lean()
      .exec();

    if (!product) {
      console.log(`❌ Product not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`✅ Product found: ${product.name}`);

    // Prevent CDN caching
    res.set('Cache-Control', 'no-store');

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(`❌ Error fetching product: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const product = await Product.create(req.body);

    // Clear cache on create
    res.set('Cache-Control', 'no-cache');

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Clear cache on update
    res.set('Cache-Control', 'no-cache');

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    // Clear cache on delete
    res.set('Cache-Control', 'no-cache');

    res.status(200).json({
      success: true,
      message: 'Product removed'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    // Optimized featured products query with limit
    const products = await Product.find({ featured: true })
      .select(PRODUCT_LIST_FIELDS)
      .sort('-rating')
      .limit(8)
      .lean()
      .exec();

    res.set('Cache-Control', 'no-store');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product filters (brands, categories for UI)
// @route   GET /api/products/filters
// @access  Public
exports.getFilters = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand').lean();
    const categories = await Product.distinct('category').lean();
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.set('Cache-Control', 'no-store');

    res.status(200).json({
      success: true,
      data: {
        brands: brands.sort(),
        categories: categories.sort(),
        priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};
