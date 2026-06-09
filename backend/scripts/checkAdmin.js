const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

const checkAdmin = async () => {
  try {
    const admin = await User.findOne({ email: 'admin@jmmobiles.com' });
    
    if (admin) {
      console.log('✅ Admin user found in database:');
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Blocked:', admin.isBlocked);
      console.log('Created:', admin.createdAt);
      console.log('\n📝 User ID:', admin._id);
    } else {
      console.log('❌ No admin user found with email: admin@jmmobiles.com');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdmin();
