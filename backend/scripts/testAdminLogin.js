const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');

const testAdminLogin = async () => {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Admin Login Test                     ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Connect to MongoDB
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mobile-shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected\n');

    // Check if admin exists
    console.log('👤 Checking for admin user in database...');
    const admin = await User.findOne({ email: 'admin@jmmobiles.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('\n💡 Solution: Run the following command:');
      console.log('   cd backend && node scripts/createAdmin.js\n');
      process.exit(1);
    }

    console.log('✅ Admin user found!');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Blocked: ${admin.isBlocked}\n`);

    // Test password comparison
    console.log('🔐 Testing password comparison...');
    const testPassword = 'admin123';
    const isPasswordCorrect = await admin.comparePassword(testPassword);
    
    if (!isPasswordCorrect) {
      console.log('❌ Password comparison FAILED!');
      console.log('   This means the password hash is incorrect.');
      console.log('\n💡 Solution:');
      console.log('   1. Delete the admin user from database:');
      console.log('      db.users.deleteOne({ email: "admin@jmmobiles.com" })');
      console.log('   2. Run: cd backend && node scripts/createAdmin.js\n');
      process.exit(1);
    }

    console.log('✅ Password verification SUCCESS!\n');

    // Test API login
    console.log('🌐 Testing API login endpoint...');
    console.log('   (Make sure backend is running on port 5000)\n');

    try {
      const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
        email: 'admin@jmmobiles.com',
        password: 'admin123'
      });

      if (loginResponse.data.success) {
        console.log('✅ API Login SUCCESSFUL!\n');
        console.log('📋 Login Response:');
        console.log(`   Token: ${loginResponse.data.data.token.substring(0, 30)}...`);
        console.log(`   User ID: ${loginResponse.data.data._id}`);
        console.log(`   Email: ${loginResponse.data.data.email}`);
        console.log(`   Role: ${loginResponse.data.data.role}\n`);

        console.log('✅ Admin login is working correctly!\n');
        console.log('🚀 You can now login to the admin dashboard with:');
        console.log('   Email: admin@jmmobiles.com');
        console.log('   Password: admin123\n');
      } else {
        console.log('❌ API Login returned success: false');
        console.log(`   Message: ${loginResponse.data.message}\n`);
      }
    } catch (apiError) {
      if (apiError.code === 'ECONNREFUSED') {
        console.log('⚠️  Backend server is not running on port 5000');
        console.log('   Start the backend with: npm run server:dev\n');
      } else {
        console.log('❌ API Login failed:');
        console.log(`   ${apiError.response?.data?.message || apiError.message}\n`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

testAdminLogin();
