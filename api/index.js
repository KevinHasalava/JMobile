/**
 * Vercel Serverless Entry Point — JM Mobiles Backend
 *
 * Vercel requires serverless functions to live inside /api at the project root.
 * This file bridges Vercel → the full Express app in /backend/server.js.
 *
 * DB connection is cached across warm Lambda invocations using Mongoose's
 * built-in connection state (see backend/config/db.js for the cache logic).
 */

const path = require('path');

// Load backend env vars (backend/.env) when running on Vercel
// On Vercel, env vars are injected via Dashboard — dotenv is a no-op there.
// Locally, this loads backend/.env so `node api/index.js` works too.
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const connectDB = require('../backend/config/db');
const app      = require('../backend/server');

// ─── Serverless handler ─────────────────────────────────────────────────────
// Ensures DB is connected before the first request is processed.
// Subsequent warm invocations return the cached Mongoose connection instantly.
module.exports = async (req, res) => {
  await connectDB();   // no-op if already connected (cached in db.js)
  return app(req, res);
};
