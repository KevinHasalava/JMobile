const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(protect, admin, getCustomers)
  .post(protect, admin, createCustomer);

router.route('/:id')
  .get(protect, admin, getCustomer)
  .put(protect, admin, updateCustomer)
  .delete(protect, admin, deleteCustomer);

module.exports = router;
