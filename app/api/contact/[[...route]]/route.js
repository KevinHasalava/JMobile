import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactInquiry from '@/models/ContactInquiry';
import { protect, admin } from '@/lib/auth';

export async function POST(req, { params }) {
  await connectDB();
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: 'Please provide all required fields' }, { status: 400 });
    }
    const inquiry = await ContactInquiry.create({ name, email, subject, message });
    return NextResponse.json({ success: true, message: 'Inquiry submitted successfully', data: inquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  await connectDB();
  const userReq = await protect(req);
  if (!userReq || !(await admin(userReq))) return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });

  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = {};
    if (statusFilter) query.status = statusFilter;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const inquiries = await ContactInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalFiltered = await ContactInquiry.countDocuments(query);
    
    // Calculate stats across ALL documents (unfiltered) for the dashboard indicators
    const total = await ContactInquiry.countDocuments();
    const newCount = await ContactInquiry.countDocuments({ status: 'new' });
    const repliedCount = await ContactInquiry.countDocuments({ status: 'replied' });
    const stats = { new: newCount, replied: repliedCount, total };

    return NextResponse.json({ 
      success: true, 
      count: inquiries.length, 
      total: totalFiltered, 
      pages: Math.ceil(totalFiltered / limit), 
      currentPage: page, 
      data: inquiries, 
      stats 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  const resolvedParams = await params;
  const route = resolvedParams?.route || [];
  
  const userReq = await protect(req);
  if (!userReq || !(await admin(userReq))) return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });

  try {
    if (route.length === 1) {
      const id = route[0];
      const { status } = await req.json();
      const inquiry = await ContactInquiry.findById(id);
      if (!inquiry) return NextResponse.json({ success: false, message: 'Inquiry not found' }, { status: 404 });

      inquiry.status = status;
      await inquiry.save();
      return NextResponse.json({ success: true, message: 'Inquiry status updated', data: inquiry }, { status: 200 });
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
  if (!userReq || !(await admin(userReq))) return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });

  try {
    if (route.length === 1) {
      const id = route[0];
      const inquiry = await ContactInquiry.findById(id);
      if (!inquiry) return NextResponse.json({ success: false, message: 'Inquiry not found' }, { status: 404 });

      await inquiry.deleteOne();
      return NextResponse.json({ success: true, message: 'Inquiry deleted' }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
}
