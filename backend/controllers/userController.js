const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.error(`❌ Password mismatch for user: ${email}`);
      console.error(`   Provided password: ${password}`);
      console.error(`   User role: ${user.role}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address,
          avatar: updatedUser.avatar,
          token: generateToken(updatedUser._id)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.status(200).json({
        success: true,
        message: 'User removed'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password (Alternative Flow using Email + Phone)
// @route   POST /api/users/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    
    if (!email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide both email and phone number' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Artificial delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 500));
      return res.status(400).json({ success: false, message: 'Account verification failed. Please check your details.' });
    }

    // Verify phone number (strip spaces and special chars, compare last 9 digits for robust matching)
    const dbPhoneStr = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
    const inputPhoneStr = phone ? phone.replace(/[^0-9]/g, '') : '';
    
    const dbPhoneMatch = dbPhoneStr.slice(-9);
    const inputPhoneMatch = inputPhoneStr.slice(-9);

    if (!dbPhoneMatch || dbPhoneMatch !== inputPhoneMatch) {
      console.log(`Failed phone verification. DB: ${dbPhoneMatch}, Input: ${inputPhoneMatch}`);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 500));
      return res.status(400).json({ success: false, message: 'Account verification failed. Please check your details.' });
    }

    // Rate Limiting Logic: Max 5 requests per hour
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (user.resetPasswordRequestWindow && (now - user.resetPasswordRequestWindow.getTime() < oneHour)) {
      if (user.resetPasswordRequestCount >= 5) {
        return res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' });
      }
      user.resetPasswordRequestCount += 1;
    } else {
      user.resetPasswordRequestCount = 1;
      user.resetPasswordRequestWindow = now;
    }

    // Get reset token (raw token is returned, hash is saved in DB)
    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Return the token directly since we verified identity via Phone + Email
    res.status(200).json({
      success: true,
      message: 'Identity verified successfully.',
      data: {
        userId: user._id,
        resetToken: resetToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/users/resetpassword/:userId/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { userId, resettoken } = req.params;

    const user = await User.findOne({
      _id: userId,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user || !user.resetPasswordToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(resettoken, user.resetPasswordToken);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    
    // Cleanup token and rate limit fields after successful use
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordRequestCount = 0;
    user.resetPasswordRequestWindow = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Login
// @route   POST /api/users/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { credential, access_token } = req.body;
    
    let email, name, picture;

    if (access_token) {
      // Custom button flow (useGoogleLogin) provides an access_token
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      email = data.email;
      name = data.name;
      picture = data.picture;
    } else if (credential) {
      // Standard button flow provides an id_token (credential)
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else {
      return res.status(400).json({ success: false, message: 'No Google token provided' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user if they don't exist
      // Since they authenticated via Google, we generate a random secure password
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name,
        email,
        password: randomPassword,
        avatar: picture,
      });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        token: generateToken(user._id)
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ success: false, message: 'Invalid Google token' });
  }
};
