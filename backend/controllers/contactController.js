const ContactInquiry = require('../models/ContactInquiry');

// @desc    Submit a contact inquiry (public)
// @route   POST /api/contact
// @access  Public
exports.submitInquiry = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, email, subject, message',
      });
    }

    const inquiry = await ContactInquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you shortly.',
      data: { id: inquiry._id },
    });

    // Emit real-time notification to admin room (after response sent)
    try {
      const io = req.app.get('io');
      if (io) {
        io.to('admin-room').emit('new_contact', {
          inquiryId: inquiry._id,
          name:    inquiry.name,
          email:   inquiry.email,
          subject: inquiry.subject,
          createdAt: inquiry.createdAt,
        });
      }
    } catch (socketErr) {
      console.warn('Socket emit failed (non-critical):', socketErr.message);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact inquiries (admin)
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllInquiries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { status, search } = req.query;

    let query = {};
    if (status && ['new', 'read', 'replied'].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const [inquiries, total, newCount, repliedCount] = await Promise.all([
      ContactInquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ContactInquiry.countDocuments(query),
      ContactInquiry.countDocuments({ status: 'new' }),
      ContactInquiry.countDocuments({ status: 'replied' }),
    ]);

    res.status(200).json({
      success: true,
      count: inquiries.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      stats: {
        new: newCount,
        replied: repliedCount,
        total: await ContactInquiry.countDocuments(),
      },
      data: inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry status (admin)
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: new, read, or replied',
      });
    }

    const inquiry = await ContactInquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Inquiry marked as "${status}"`,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inquiry (admin)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await ContactInquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    await inquiry.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
