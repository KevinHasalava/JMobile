const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const setupSocket = require('./config/socket');

// Load env vars
dotenv.config();

// ─── Shared CORS origin resolver ─────────────────────────────────────────────
// Dynamically allows ANY origin that contains '.vercel.app' (covers all
// preview + production branch URLs) or any localhost port (local dev).
// Does NOT rely on CLIENT_URL or any hardcoded domain list.
const corsOriginResolver = (origin, callback) => {
  // Allow server-to-server / Postman / mobile (no origin header)
  if (!origin) return callback(null, true);
  // Allow any *.vercel.app deployment — preview branches, prod, aliases
  if (origin.includes('.vercel.app')) return callback(null, true);
  // Allow any localhost port for local development
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
  // Allow CLIENT_URL only if it is explicitly set and is not a localhost value
  const clientUrl = process.env.CLIENT_URL;
  if (clientUrl && !clientUrl.includes('localhost') && origin === clientUrl) {
    return callback(null, true);
  }
  return callback(new Error(`CORS blocked: ${origin}`));
};

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: corsOriginResolver,
    credentials: true
  }
});

// Setup Socket.io event handlers
setupSocket(io);

// Make io accessible to routes
app.set('io', io);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS — uses shared resolver defined above
app.use(cors({
  origin: corsOriginResolver,
  credentials: true
}));

// 🔥 IMPORTANT: Serve uploaded files BEFORE routes
// This ensures static files are served before API routes are evaluated
const uploadsPath = path.join(__dirname, 'uploads');
console.log(`📁 Serving static uploads from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d', // Cache static files for 1 day
  etag: false   // Disable ETag for better performance
}));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api', require('./routes/taxonomyRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile Shop API is running...',
    version: '1.0.0'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// ─── Only start the HTTP server when run directly (local dev) ───────────────
// When required as a module by Vercel serverless (api/index.js), skip listen().
// process.exit() inside the IIFE would kill the serverless function otherwise.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  (async () => {
    try {
      await connectDB();
      server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`Socket.io server ready`);
      });
    } catch (error) {
      console.error(`❌ Failed to start server: ${error.message}`);
      process.exit(1);
    }
  })();

  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = app;

