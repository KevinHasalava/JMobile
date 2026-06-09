const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllBrands,
  createBrand,
  getAllCategories,
  createCategory
} = require('../controllers/taxonomyController');

// Brand routes
router.route('/brands')
  .get(getAllBrands)
  .post(protect, admin, createBrand);

// Category routes
router.route('/categories')
  .get(getAllCategories)
  .post(protect, admin, createCategory);

module.exports = router;
