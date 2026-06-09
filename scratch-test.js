const mongoose = require('mongoose');
const Product = require('./backend/models/Product');
require('dotenv').config({ path: './backend/.env' });

const testDb = async () => {
  try {
    console.log('URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected');
    
    const query = {};
    const count = await Product.countDocuments(query);
    console.log('Count:', count);
    
    const products = await Product.find(query).limit(1);
    console.log('Products:', products);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

testDb();
