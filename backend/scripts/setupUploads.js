const fs = require('fs');
const path = require('path');

// Create uploads directory structure
const uploadDirs = [
  'uploads',
  'uploads/products',
  'uploads/products/images',
  'uploads/products/videos'
];

uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`✓ Directory already exists: ${dir}`);
  }
});

console.log('\n✅ Upload directories setup complete!');
