const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

const testLogin = async () => {
  try {
    const email = 'admin@jmmobiles.com';
    const password = 'admin123';
    
    console.log('🔍 Testing login for:', email);
    console.log('🔑 Password:', password);
    console.log('');
    
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ User found');
    console.log('Stored password hash:', user.password);
    console.log('');
    
    // Test password comparison
    const isMatch = await user.comparePassword(password);
    
    console.log('Password match result:', isMatch);
    
    if (isMatch) {
      console.log('✅ Password is CORRECT!');
      console.log('');
      console.log('You can login with:');
      console.log('Email:', email);
      console.log('Password:', password);
    } else {
      console.log('❌ Password is WRONG!');
      console.log('');
      console.log('The password might not have been hashed correctly.');
      console.log('Let me reset it...');
      
      // Reset password
      user.password = 'admin123';
      await user.save();
      
      console.log('✅ Password has been reset to: admin123');
      console.log('Please try logging in again.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testLogin();
