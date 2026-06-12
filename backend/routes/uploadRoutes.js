const express = require('express');
const router = express.Router();
const { uploadProductMedia, uploadBankSlip } = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// ─── Serve uploaded files from /tmp (Vercel) or local uploads/ (dev) ──────────
// On Vercel the /uploads static middleware in server.js never has the files
// because they're written to /tmp. This route bridges that gap: all uploaded
// media is accessed via /api/upload/serve?file=<relative-path> which routes
// through the serverless function and reads directly from /tmp.
// @route   GET /api/upload/serve
// @access  Public
const isVercel = process.env.VERCEL === '1';
const uploadBase = isVercel ? '/tmp' : path.join(__dirname, '../uploads');

router.get('/serve', (req, res) => {
  try {
    const { file } = req.query;
    if (!file) {
      return res.status(400).json({ success: false, message: 'file query param required' });
    }

    // Prevent path traversal
    const safeName = file.replace(/\.\.\//g, '').replace(/\\/g, '/');
    const absolutePath = path.join(uploadBase, safeName);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.sendFile(absolutePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ success: false, message: 'Error serving file' });
  }
});

// @desc    Upload product images and/or video
// @route   POST /api/upload/product
// @access  Private/Admin
router.post('/product', protect, admin, (req, res) => {
  uploadProductMedia(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    const uploadedFiles = {
      images: [],
      video: null
    };

    // Process uploaded images
    if (req.files && req.files.images) {
      uploadedFiles.images = req.files.images.map(file => {
        let finalPath = `/api/upload/serve?file=products/images/${file.filename}`;
        
        // On Vercel, convert to Base64 to bypass ephemeral /tmp storage disappearing
        if (isVercel) {
          const absolutePath = path.join('/tmp/products/images', file.filename);
          if (fs.existsSync(absolutePath)) {
            const base64Data = fs.readFileSync(absolutePath, 'base64');
            finalPath = `data:${file.mimetype};base64,${base64Data}`;
            // Clean up to save /tmp space
            try { fs.unlinkSync(absolutePath); } catch(e) {}
          }
        }

        return {
          filename: file.filename,
          path: finalPath,
          size: file.size,
          mimetype: file.mimetype
        };
      });
    }

    // Process uploaded video
    if (req.files && req.files.video && req.files.video[0]) {
      const videoFile = req.files.video[0];
      let finalPath = `/api/upload/serve?file=products/videos/${videoFile.filename}`;
      
      if (isVercel) {
        const absolutePath = path.join('/tmp/products/videos', videoFile.filename);
        if (fs.existsSync(absolutePath)) {
          // Warning: large videos will hit MongoDB 16MB document limit
          const base64Data = fs.readFileSync(absolutePath, 'base64');
          finalPath = `data:${videoFile.mimetype};base64,${base64Data}`;
          try { fs.unlinkSync(absolutePath); } catch(e) {}
        }
      }

      uploadedFiles.video = {
        filename: videoFile.filename,
        path: finalPath,
        size: videoFile.size,
        mimetype: videoFile.mimetype
      };
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles
    });
  });
});

// @desc    Upload bank slip
// @route   POST /api/upload/bank-slip
// @access  Private
router.post('/bank-slip', protect, (req, res) => {
  uploadBankSlip(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a bank slip file'
      });
    }

    let finalPath = `/api/upload/serve?file=bank-slips/${req.file.filename}`;
    
    if (isVercel) {
      const absolutePath = path.join('/tmp/bank-slips', req.file.filename);
      if (fs.existsSync(absolutePath)) {
        const base64Data = fs.readFileSync(absolutePath, 'base64');
        finalPath = `data:${req.file.mimetype};base64,${base64Data}`;
        try { fs.unlinkSync(absolutePath); } catch(e) {}
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bank slip uploaded successfully',
      data: {
        filename: req.file.filename,
        path: finalPath,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  });
});

// @desc    Upload user avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, (req, res) => {
  const { uploadAvatar } = require('../middleware/upload');
  uploadAvatar(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an avatar image'
      });
    }

    let finalPath = `/api/upload/serve?file=avatars/${req.file.filename}`;
    
    if (isVercel) {
      const absolutePath = path.join('/tmp/avatars', req.file.filename);
      if (fs.existsSync(absolutePath)) {
        const base64Data = fs.readFileSync(absolutePath, 'base64');
        finalPath = `data:${req.file.mimetype};base64,${base64Data}`;
        try { fs.unlinkSync(absolutePath); } catch(e) {}
      }
    }

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        filename: req.file.filename,
        path: finalPath,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  });
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/file
// @access  Private/Admin
router.delete('/file', protect, admin, (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }

    // Construct absolute path
    const absolutePath = path.join(__dirname, '..', filePath);

    // Check if file exists
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

module.exports = router;
