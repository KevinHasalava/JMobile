const express = require('express');
const router = express.Router();
const { uploadProductMedia } = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

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
      uploadedFiles.images = req.files.images.map(file => ({
        filename: file.filename,
        path: `/uploads/products/images/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));
    }

    // Process uploaded video
    if (req.files && req.files.video && req.files.video[0]) {
      const videoFile = req.files.video[0];
      uploadedFiles.video = {
        filename: videoFile.filename,
        path: `/uploads/products/videos/${videoFile.filename}`,
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
