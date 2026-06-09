const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const products = [
  {
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    model: '15 Pro Max',
    price: 1199,
    originalPrice: 1299,
    description: 'The latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
    specifications: {
      display: '6.7" Super Retina XDR OLED',
      processor: 'A17 Pro chip',
      ram: '8GB',
      storage: '256GB',
      camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
      battery: '4422mAh',
      os: 'iOS 17',
      color: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium']
    },
    images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500'],
    category: 'smartphone',
    stock: 50,
    featured: true,
    rating: 4.8,
    numReviews: 156
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    model: 'S24 Ultra',
    price: 1199,
    originalPrice: 1299,
    description: 'Premium Android flagship with S Pen, powerful performance, and exceptional camera.',
    specifications: {
      display: '6.8" Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '256GB',
      camera: '200MP Main + 50MP Periscope + 12MP Ultra Wide + 10MP Telephoto',
      battery: '5000mAh',
      os: 'Android 14, One UI 6',
      color: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow']
    },
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'],
    category: 'smartphone',
    stock: 45,
    featured: true,
    rating: 4.7,
    numReviews: 132
  },
  {
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    price: 999,
    originalPrice: 1099,
    description: 'Google\'s flagship with AI-powered features, excellent camera, and pure Android experience.',
    specifications: {
      display: '6.7" LTPO OLED',
      processor: 'Google Tensor G3',
      ram: '12GB',
      storage: '128GB',
      camera: '50MP Main + 48MP Ultra Wide + 48MP Telephoto',
      battery: '5050mAh',
      os: 'Android 14',
      color: ['Obsidian', 'Porcelain', 'Bay']
    },
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500'],
    category: 'smartphone',
    stock: 35,
    featured: true,
    rating: 4.6,
    numReviews: 98
  },
  {
    name: 'OnePlus 12',
    brand: 'OnePlus',
    model: '12',
    price: 799,
    originalPrice: 899,
    description: 'Fast flagship with OxygenOS, powerful hardware, and smooth performance.',
    specifications: {
      display: '6.82" LTPO AMOLED',
      processor: 'Snapdragon 8 Gen 3',
      ram: '16GB',
      storage: '256GB',
      camera: '50MP Main + 64MP Periscope + 48MP Ultra Wide',
      battery: '5400mAh',
      os: 'Android 14, OxygenOS 14',
      color: ['Flowy Emerald', 'Silky Black']
    },
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
    category: 'smartphone',
    stock: 40,
    featured: true,
    rating: 4.5,
    numReviews: 87
  },
  {
    name: 'Xiaomi 14 Pro',
    brand: 'Xiaomi',
    model: '14 Pro',
    price: 699,
    originalPrice: 799,
    description: 'Premium smartphone with Leica camera system and powerful performance.',
    specifications: {
      display: '6.73" LTPO AMOLED',
      processor: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '256GB',
      camera: '50MP Main + 50MP Telephoto + 50MP Ultra Wide',
      battery: '4880mAh',
      os: 'Android 14, HyperOS',
      color: ['Black', 'White', 'Green']
    },
    images: ['https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500'],
    category: 'smartphone',
    stock: 60,
    featured: false,
    rating: 4.4,
    numReviews: 76
  },
  {
    name: 'iPhone 14',
    brand: 'Apple',
    model: '14',
    price: 799,
    originalPrice: 899,
    description: 'Previous generation iPhone with great performance and camera.',
    specifications: {
      display: '6.1" Super Retina XDR OLED',
      processor: 'A15 Bionic chip',
      ram: '6GB',
      storage: '128GB',
      camera: '12MP Main + 12MP Ultra Wide',
      battery: '3279mAh',
      os: 'iOS 17',
      color: ['Blue', 'Purple', 'Midnight', 'Starlight', 'Red']
    },
    images: ['https://images.unsplash.com/photo-1663499482523-1c0d9d77db0b?w=500'],
    category: 'smartphone',
    stock: 55,
    featured: false,
    rating: 4.6,
    numReviews: 234
  },
  {
    name: 'Samsung Galaxy A54',
    brand: 'Samsung',
    model: 'A54',
    price: 449,
    originalPrice: 499,
    description: 'Mid-range smartphone with excellent value and features.',
    specifications: {
      display: '6.4" Super AMOLED',
      processor: 'Exynos 1380',
      ram: '8GB',
      storage: '128GB',
      camera: '50MP Main + 12MP Ultra Wide + 5MP Macro',
      battery: '5000mAh',
      os: 'Android 13, One UI 5',
      color: ['Awesome Violet', 'Awesome Graphite', 'Awesome Lime']
    },
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'],
    category: 'smartphone',
    stock: 75,
    featured: false,
    rating: 4.3,
    numReviews: 145
  },
  {
    name: 'iPad Pro 12.9"',
    brand: 'Apple',
    model: 'iPad Pro',
    price: 1099,
    originalPrice: 1199,
    description: 'Powerful tablet with M2 chip and stunning display.',
    specifications: {
      display: '12.9" Liquid Retina XDR',
      processor: 'Apple M2 chip',
      ram: '8GB',
      storage: '128GB',
      camera: '12MP Wide + 10MP Ultra Wide',
      battery: '10758mAh',
      os: 'iPadOS 17',
      color: ['Silver', 'Space Gray']
    },
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'],
    category: 'tablet',
    stock: 30,
    featured: false,
    rating: 4.7,
    numReviews: 89
  }
];

const connectDB = async () => {
  try {
    console.log('\n🔍 Connecting to MongoDB...');
    console.log(`📍 URI: ${process.env.MONGO_URI}\n`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB Connected Successfully\n');
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n💡 TROUBLESHOOTING:');
    console.error('1. Make sure MongoDB is running locally or provide a valid MONGO_URI');
    console.error('2. Check your .env file has the correct MONGO_URI');
    console.error('3. For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/dbname\n');
    process.exit(1);
  }
};

const seedProducts = async () => {
  try {
    await connectDB();

    // Clear existing products
    console.log('🗑️  Clearing existing products...');
    const deleteResult = await Product.deleteMany({});
    console.log(`   Removed ${deleteResult.deletedCount} products\n`);

    // Find or create an admin user for created products
    console.log('👤 Setting up admin user...');
    let adminUser = await User.findOne({ email: 'admin@jmmobiles.com' });
    
    if (adminUser) {
      console.log('   ✓ Admin user already exists');
    } else {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@jmmobiles.com',
        password: 'admin123',
        role: 'admin',
        phone: '0771234567'
      });
      console.log('   ✓ Admin user created\n');
    }

    // Add admin user ID to products
    const productsWithAdmin = products.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));

    // Insert products
    console.log('📦 Inserting products into database...');
    const createdProducts = await Product.insertMany(productsWithAdmin);
    console.log(`   ✓ ${createdProducts.length} products seeded successfully\n`);

    console.log('╔════════════════════════════════════════╗');
    console.log('║   ✅ SEEDING COMPLETE                  ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    console.log('📊 Summary:');
    console.log(`   - ${createdProducts.length} products added to database`);
    console.log(`   - Products by category:`);
    
    const categories = {};
    createdProducts.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`     • ${cat}: ${count} products`);
    });

    console.log('\n🔐 Admin Credentials:');
    console.log('   Email: admin@jmmobiles.com');
    console.log('   Password: admin123');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Start your backend: npm run server:dev');
    console.log('   2. Start your frontend: npm run client');
    console.log('   3. Or run both: npm run dev');
    console.log('   4. Open http://localhost:3000 in your browser');
    console.log('   5. Products should now display on the Products page\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error.message);
    console.error('\nFull error details:', error);
    process.exit(1);
  }
};

seedProducts();
