import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { protect, admin as checkAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  await connectDB();
  const resolvedParams = await params;
  const route = resolvedParams?.route || [];
  const searchParams = req.nextUrl.searchParams;

  const userReq = await protect(req);
  if (!userReq || !(await checkAdmin(userReq))) return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });

  try {
    if (route[0] === 'dashboard-stats') {
      const totalUsers = await User.countDocuments({ role: 'user' });
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();
      const orders = await Order.find({ paymentStatus: 'paid' });
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const recentOrders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5);

      const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const monthlySales = await Order.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, paymentStatus: 'paid' } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const topProducts = await Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productInfo' } },
        { $unwind: '$productInfo' }
      ]);

      const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).limit(5);

      return NextResponse.json({ success: true, data: { overview: { totalUsers, totalProducts, totalOrders, totalRevenue }, recentOrders, monthlySales, topProducts, lowStockProducts } }, { status: 200 });
    }

    if (route[0] === 'users') {
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 10;
      const skip = (page - 1) * limit;
      const search = searchParams.get('search') || '';
      const searchQuery = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};

      const users = await User.find({ ...searchQuery, role: 'user' }).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);
      const total = await User.countDocuments({ ...searchQuery, role: 'user' });
      return NextResponse.json({ success: true, count: users.length, total, pages: Math.ceil(total / limit), currentPage: page, data: users }, { status: 200 });
    }

    if (route[0] === 'orders') {
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 10;
      const skip = (page - 1) * limit;
      const status = searchParams.get('status') || '';
      const statusQuery = status ? { orderStatus: status } : {};

      const orders = await Order.find(statusQuery).populate('user', 'name email').populate('items.product', 'name image').sort({ createdAt: -1 }).skip(skip).limit(limit);
      const total = await Order.countDocuments(statusQuery);
      return NextResponse.json({ success: true, count: orders.length, total, pages: Math.ceil(total / limit), currentPage: page, data: orders }, { status: 200 });
    }

    if (route[0] === 'products') {
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 10;
      const skip = (page - 1) * limit;
      const search = searchParams.get('search');
      const brand = searchParams.get('brand');
      const category = searchParams.get('category');

      let query = {};
      if (search) query.name = { $regex: search, $options: 'i' };
      if (brand) query.brand = brand;
      if (category) query.category = category;

      const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
      const total = await Product.countDocuments(query);

      const rawBrands = await Product.distinct('brand');
      const rawCategories = await Product.distinct('category');
      const brands = [...new Set(rawBrands.map(b => b?.toLowerCase()))].map(lower => rawBrands.find(b => b?.toLowerCase() === lower)).filter(Boolean);
      const categories = [...new Set(rawCategories.map(c => c?.toLowerCase()))].map(lower => rawCategories.find(c => c?.toLowerCase() === lower)).filter(Boolean);

      return NextResponse.json({ success: true, count: products.length, total, pages: Math.ceil(total / limit), currentPage: page, filters: { brands, categories }, data: products }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
}

export async function POST(req, { params }) {
  await connectDB();
  const resolvedParams = await params;
  const route = resolvedParams?.route || [];
  
  const userReq = await protect(req);
  if (!userReq || !(await checkAdmin(userReq))) return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });

  try {
    if (route[0] === 'products') {
      const body = await req.json();
      if (body.images && Array.isArray(body.images)) {
        body.images = body.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
      }
      const product = await Product.create(body);
      return NextResponse.json({ success: true, message: 'Product created successfully', data: product }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
}

export async function PUT(req, { params }) {
  await connectDB();
  const resolvedParams = await params;
  const route = resolvedParams?.route || [];
  
  const userReq = await protect(req);
  if (!userReq || !(await checkAdmin(userReq))) return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });

  try {
    if (route[0] === 'users' && route[2] === 'block') {
      const id = route[1];
      const user = await User.findById(id);
      if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      if (user.role === 'admin') return NextResponse.json({ success: false, message: 'Cannot block admin users' }, { status: 400 });

      user.isBlocked = !user.isBlocked;
      await user.save();
      return NextResponse.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, data: user }, { status: 200 });
    }

    if (route[0] === 'orders' && route[2] === 'status') {
      const id = route[1];
      const { orderStatus, paymentStatus } = await req.json();
      const order = await Order.findById(id);
      if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      await order.save();
      return NextResponse.json({ success: true, message: 'Order status updated successfully', data: order }, { status: 200 });
    }

    if (route[0] === 'products' && route.length === 2) {
      const id = route[1];
      const body = await req.json();
      if (body.images && Array.isArray(body.images)) {
        body.images = body.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
      }
      const product = await Product.findById(id);
      if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

      const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
      return NextResponse.json({ success: true, message: 'Product updated successfully', data: updatedProduct }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
}

export async function DELETE(req, { params }) {
  await connectDB();
  const resolvedParams = await params;
  const route = resolvedParams?.route || [];
  
  const userReq = await protect(req);
  if (!userReq || !(await checkAdmin(userReq))) return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });

  try {
    if (route[0] === 'users' && route.length === 2) {
      const id = route[1];
      const user = await User.findById(id);
      if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      if (user.role === 'admin') return NextResponse.json({ success: false, message: 'Cannot delete admin users' }, { status: 400 });

      await user.deleteOne();
      return NextResponse.json({ success: true, message: 'User deleted successfully' }, { status: 200 });
    }

    if (route[0] === 'orders' && route.length === 2) {
      const id = route[1];
      const order = await Order.findById(id);
      if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

      await order.deleteOne();
      return NextResponse.json({ success: true, message: 'Order deleted successfully' }, { status: 200 });
    }

    if (route[0] === 'products' && route.length === 2) {
      const id = route[1];
      const product = await Product.findById(id);
      if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

      await product.deleteOne();
      return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
}
