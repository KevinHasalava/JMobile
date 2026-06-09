const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mobile-shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected for Admin Creation'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Admin credentials
    const adminData = {
      name: 'Admin User',
      email: 'admin@jmmobiles.com',
      password: 'admin123', // Change this to your desired password
      phone: '0771234567',
      role: 'admin',
      isBlocked: false
    };

    console.log('\n🔍 Checking for existing admin user...');
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminData.email);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ User role updated to admin');
      } else {
        console.log('✅ User is already an admin');
      }
      
      console.log('\n📋 Admin Login Credentials:');
      console.log('═══════════════════════════════════');
      console.log('📧 Email:    admin@jmmobiles.com');
      console.log('🔑 Password: admin123');
      console.log('═══════════════════════════════════');
      
      process.exit(0);
    }

    console.log('👤 Creating new admin user...');
    // Create admin user - DO NOT hash password here!
    // User model pre-save hook will handle hashing
    const admin = await User.create(adminData);
    
    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('═══════════════════════════════════');
    console.log('📧 Email:    admin@jmmobiles.com');
    console.log('🔑 Password: admin123');
    console.log('═══════════════════════════════════');
    console.log('\n⚠️  ⚠️  ⚠️  IMPORTANT ⚠️  ⚠️  ⚠️');
    console.log('Please change the password after first login!');
    console.log('Go to Admin Dashboard → Settings → Change Password');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('   Email already exists in database');
    }
    process.exit(1);
  }
};

createAdmin();
