const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Directory setup ──────────────────────────────────────────────────────────
// Vercel has a read-only filesystem — use /tmp on Vercel, local uploads/ in dev
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel ? '/tmp' : path.join(__dirname, '../uploads');
const productImagesDir = isVercel ? '/tmp/products/images' : path.join(uploadDir, 'products/images');
const productVideosDir = isVercel ? '/tmp/products/videos' : path.join(uploadDir, 'products/videos');
const bankSlipsDir = isVercel ? '/tmp/bank-slips' : path.join(uploadDir, 'bank-slips');

// Create directories at module load time for local dev.
// On Vercel we CANNOT rely on this because /tmp subdirectories are NOT
// preserved across cold starts — directories are instead created on-demand
// inside every multer destination() callback via ensureDir().
if (!isVercel) {
  [productImagesDir, productVideosDir, bankSlipsDir].forEach((dir) => {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.warn(`Could not create directory ${dir}:`, e.message);
    }
  });
}

// ─── File filters ─────────────────────────────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
  }
};

const videoFileFilter = (req, file, cb) => {
  const allowedExt = /mp4|avi|mov|wmv|flv|mkv|webm/;
  if (allowedExt.test(path.extname(file.originalname).toLowerCase()) && /video/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (mp4, avi, mov, wmv, flv, mkv, webm) are allowed'), false);
  }
};

// Bank slip: accepts images AND PDF
const slipFileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|pdf|webp/;
  const allowedMime = /image\/(jpeg|jpg|png|webp)|application\/pdf/;
  if (
    allowedExt.test(path.extname(file.originalname).toLowerCase()) &&
    allowedMime.test(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image files or PDFs are allowed for bank slips'), false);
  }
};

// ─── Helper: ensure a directory exists at request time ────────────────────────
// Called inside every multer destination() callback so that on Vercel (where
// /tmp subdirectories are NOT pre-created) the path is force-created before
// multer tries to write the file — preventing ENOENT crashes on cold starts.
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ─── Product image storage ────────────────────────────────────────────────────
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(productImagesDir);
    cb(null, productImagesDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${unique}${path.extname(file.originalname)}`);
  },
});

// ─── Bank slip storage ────────────────────────────────────────────────────────
const slipStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(bankSlipsDir);
    cb(null, bankSlipsDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `slip-${unique}${path.extname(file.originalname)}`);
  },
});

// ─── Multer instances ─────────────────────────────────────────────────────────
const uploadProductImages = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: imageFileFilter,
}).array('images', 5);

const uploadProductVideo = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDir(productVideosDir);
      cb(null, productVideosDir);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `video-${unique}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: videoFileFilter,
}).single('video');

// Combined product media (images + optional video)
const uploadProductMedia = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = file.fieldname === 'video' ? productVideosDir : productImagesDir;
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const prefix = file.fieldname === 'video' ? 'video-' : 'product-';
      cb(null, `${prefix}${unique}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'images') return imageFileFilter(req, file, cb);
    if (file.fieldname === 'video') return videoFileFilter(req, file, cb);
    cb(new Error('Unexpected field'), false);
  },
}).fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 },
]);

// Bank slip — single file, image or PDF, max 10 MB
const uploadBankSlip = multer({
  storage: slipStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: slipFileFilter,
}).single('bankSlip');

module.exports = {
  uploadProductImages,
  uploadProductVideo,
  uploadProductMedia,
  uploadBankSlip,
};
