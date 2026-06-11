const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail, sendBankSlipVerificationEmail } = require('../utils/emailService');

// @desc    Create new order (supports bank_transfer with slip)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      bankSlip, // { depositorName, transactionId, filename, path }
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    // Verify stock availability and reduce stock atomically
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
        });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    const orderData = {
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'bank_transfer',
      itemsPrice: itemsPrice || 0,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice: totalPrice || 0,
      totalAmount: totalPrice || 0,
    };

    // Attach bank slip if provided
    if (bankSlip) {
      orderData.bankSlip = {
        ...bankSlip,
        uploadedAt: new Date(),
      };
      orderData.bankSlipStatus = 'pending_review';
    }

    const order = await Order.create(orderData);

    // Emit socket notification to admin-room
    try {
      const io = req.app.get('io');
      if (io) {
        io.to('admin-room').emit('new_order', {
          orderId: order._id,
          customerName: req.user.name,
          total: order.totalPrice,
          paymentMethod: order.paymentMethod,
          hasSlip: !!bankSlip,
          createdAt: order.createdAt,
        });
      }
    } catch (socketErr) {
      console.warn('Socket emit failed (non-critical):', socketErr.message);
    }

    // Send email to customer
    if (req.user) {
      await sendOrderConfirmationEmail(order, req.user);
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only owner or admin can view
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const statusFilter = req.query.status ? { orderStatus: req.query.status } : {};
    const slipFilter = req.query.slipStatus ? { bankSlipStatus: req.query.slipStatus } : {};
    const query = { ...statusFilter, ...slipFilter };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('items.product', 'name images')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = 'paid';
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Bug fix: was setting order.status (doesn't exist), now uses orderStatus
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = 'delivered';

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Bug fix: was setting order.status (doesn't exist), now uses orderStatus
    const { orderStatus, paymentStatus } = req.body;
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // Mark as delivered automatically
    if (orderStatus === 'delivered' && !order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    // Notify user via socket
    try {
      const io = req.app.get('io');
      if (io && order.user) {
        io.to(order.user.toString()).emit('order_status_updated', {
          orderId: order._id,
          status: updatedOrder.orderStatus,
          paymentStatus: updatedOrder.paymentStatus,
        });
      }
    } catch (socketErr) {
      console.warn('Socket emit failed (non-critical):', socketErr.message);
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (user)
// @route   DELETE /api/orders/:id
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Bug fix: was checking order.status (doesn't exist), now uses orderStatus
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that is already shipped or delivered',
      });
    }

    // Restore stock (schema uses 'items', not 'orderItems')
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify bank slip (admin approve/reject)
// @route   PUT /api/orders/:id/verify-slip
// @access  Private/Admin
exports.verifyBankSlip = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be "approve" or "reject"' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (action === 'approve') {
      order.bankSlipStatus = 'approved';
      order.paymentStatus = 'paid';
      order.isPaid = true;
      order.paidAt = new Date();
      order.orderStatus = 'processing';
    } else {
      order.bankSlipStatus = 'rejected';
      order.bankSlipRejectionReason = rejectionReason || 'Slip could not be verified';
      order.paymentStatus = 'failed';
    }

    const updatedOrder = await order.save();

    // Notify user via socket
    try {
      const io = req.app.get('io');
      if (io && order.user) {
        const eventName = action === 'approve' ? 'payment_approved' : 'payment_rejected';
        io.to(order.user._id.toString()).emit(eventName, {
          orderId: order._id,
          status: updatedOrder.bankSlipStatus,
          reason: updatedOrder.bankSlipRejectionReason,
        });
        // Also emit order_status_updated
        io.to(order.user._id.toString()).emit('order_status_updated', {
          orderId: order._id,
          status: updatedOrder.orderStatus,
          paymentStatus: updatedOrder.paymentStatus,
        });
      }
    } catch (socketErr) {
      console.warn('Socket emit failed (non-critical):', socketErr.message);
    }

    // Send email notification to customer
    await sendBankSlipVerificationEmail(updatedOrder);

    res.status(200).json({
      success: true,
      message: `Bank slip ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
