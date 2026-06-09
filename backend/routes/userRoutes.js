const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  getUsers,
  deleteUser,
  forgotPassword,
  resetPassword,
  googleLogin
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:userId/:resettoken', resetPassword);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .delete(protect, admin, deleteUser);

module.exports = router;
