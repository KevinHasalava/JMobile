const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('\n🔍 MongoDB Connection Attempt:');
    console.log(`   URI: ${mongoUri}`);

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`\n✅ MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState} (1=connected)\n`);

    return conn;
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error\n`);
    console.error(`   Error: ${error.message}\n`);
    console.error(`📌 TROUBLESHOOTING STEPS:\n`);

    if (error.message.includes('ECONNREFUSED')) {
      console.error(`   1️⃣  MongoDB service is NOT running locally`);
      console.error(`   2️⃣  SOLUTION OPTIONS:\n`);
      console.error(`       A) Install MongoDB Community Edition:`);
      console.error(`          - Download: https://www.mongodb.com/try/download/community`);
      console.error(`          - Run installer with "Install as Windows Service" checked`);
      console.error(`          - Start service: net start MongoDB (or MongoDB_mnt_3_0)\n`);
      console.error(`       B) Use MongoDB Atlas (Cloud):`);
      console.error(`          - Update MONGO_URI in .env with your Atlas connection string`);
      console.error(`          - Format: mongodb+srv://user:pass@cluster.mongodb.net/dbname\n`);
    } else if (error.message.includes('authentication failed')) {
      console.error(`   Invalid MongoDB credentials`);
      console.error(`   - Check username/password in MONGO_URI`);
      console.error(`   - For local MongoDB, no auth needed: mongodb://localhost:27017/dbname\n`);
    } else if (error.message.includes('ENOTFOUND')) {
      console.error(`   - MongoDB cluster address not found (DNS issue)`);
      console.error(`   - Check your internet connection`);
      console.error(`   - Verify connection string is correct\n`);
    }

    console.error(`💡 Server will continue running in MOCK MODE`);
    console.error(`   - API endpoints will use sample data`);
    console.error(`   - Database operations will NOT work\n`);

    // Don't exit - allow server to continue with mock data
    return null;
  }
};

module.exports = connectDB;
