import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { protect, admin, generateToken } from '@/lib/auth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req, { params }) {
  await connectDB();
  const resolvedParams = await params;
  const route = resolvedParams?.route || [];
  const action = route[0];

  try {
    if (action === 'register') {
      const { name, email, password, phone, address } = await req.json();
      const userExists = await User.findOne({ email });
      if (userExists) return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });

      const user = await User.create({ name, email, password, phone, address });
      if (user) {
        return NextResponse.json({
          success: true,
          data: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar, token: generateToken(user._id) }
        }, { status: 201 });
      } else {
        return NextResponse.json({ success: false, message: 'Invalid user data' }, { status: 400 });
      }
    }

    if (action === 'login') {
      const { email, password } = await req.json();
      if (!email || !password) return NextResponse.json({ success: false, message: 'Please provide email and password' }, { status: 400 });

      const user = await User.findOne({ email }).select('+password');
      if (!user) return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
      if (user.isBlocked) return NextResponse.json({ success: false, message: 'Your account has been blocked. Please contact support.' }, { status: 403 });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });

      return NextResponse.json({
        success: true,
        data: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar, token: generateToken(user._id) }
      }, { status: 200 });
    }

    if (action === 'google') {
      const { credential, access_token } = await req.json();
      let email, name, picture;

      if (access_token) {
        const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${access_token}` } });
        email = data.email; name = data.name; picture = data.picture;
      } else if (credential) {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        email = payload.email; name = payload.name; picture = payload.picture;
      } else {
        return NextResponse.json({ success: false, message: 'No Google token provided' }, { status: 400 });
      }

      let user = await User.findOne({ email });
      if (!user) {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        user = await User.create({ name, email, password: randomPassword, avatar: picture });
      }
      if (user.isBlocked) return NextResponse.json({ success: false, message: 'Your account has been blocked' }, { status: 403 });

      return NextResponse.json({
        success: true,
        data: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar, token: generateToken(user._id) }
      }, { status: 200 });
    }

    if (action === 'check-email') {
      const { email } = await req.json();
      if (!email) return NextResponse.json({ success: false, message: 'Please provide email' }, { status: 400 });

      const user = await User.findOne({ email });
      if (!user) return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
      if (!user.phone) return NextResponse.json({ success: false, message: 'No phone number linked to this account' }, { status: 400 });

      const phoneStr = user.phone.replace(/[^0-9]/g, '');
      const lastTwo = phoneStr.slice(-2);
      
      return NextResponse.json({ success: true, data: { lastTwo } }, { status: 200 });
    }

    if (action === 'forgotpassword') {
      const { email, phone } = await req.json();
      if (!email || !phone) return NextResponse.json({ success: false, message: 'Please provide both email and phone number' }, { status: 400 });

      const user = await User.findOne({ email });
      if (!user) return NextResponse.json({ success: false, message: 'Account verification failed.' }, { status: 400 });

      const dbPhoneStr = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
      const inputPhoneStr = phone ? phone.replace(/[^0-9]/g, '') : '';
      const dbPhoneMatch = dbPhoneStr.slice(-9);
      const inputPhoneMatch = inputPhoneStr.slice(-9);

      if (!dbPhoneMatch || dbPhoneMatch !== inputPhoneMatch) return NextResponse.json({ success: false, message: 'Account verification failed.' }, { status: 400 });

      const resetToken = await user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      return NextResponse.json({ success: true, message: 'Identity verified successfully.', data: { userId: user._id, resetToken: resetToken } }, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
}

export async function GET(req, { params }) {
  await connectDB();
  const resolvedParams = await params;
  const route = resolvedParams?.route || [];
  const action = route[0];

  const userReq = await protect(req);
  if (!userReq) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

  try {
    if (action === 'profile' || route.length === 0) { // /api/users/profile or /api/users
      if (route.length === 0 && action === undefined) {
         // get all users
         if (!(await admin(userReq))) return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
         const users = await User.find({});
         return NextResponse.json({ success: true, count: users.length, data: users }, { status: 200 });
      }

      if (action === 'profile') {
        const user = await User.findById(userReq._id);
        if (user) {
          return NextResponse.json({ success: true, data: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar, createdAt: user.createdAt } }, { status: 200 });
        }
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }
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
  const action = route[0];

  try {
    if (action === 'resetpassword') {
      const userId = route[1];
      const resettoken = route[2];
      const { password } = await req.json();

      const user = await User.findOne({ _id: userId, resetPasswordExpire: { $gt: Date.now() } });
      if (!user || !user.resetPasswordToken) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 400 });

      const isMatch = await bcrypt.compare(resettoken, user.resetPasswordToken);
      if (!isMatch) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 400 });

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return NextResponse.json({ success: true, message: 'Password reset successful', data: { _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) } }, { status: 200 });
    }

    if (action === 'profile') {
      const userReq = await protect(req);
      if (!userReq) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

      const { name, email, phone, address, avatar, password } = await req.json();
      const user = await User.findById(userReq._id);

      if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        if (avatar !== undefined) user.avatar = avatar;
        if (password) user.password = password;

        const updatedUser = await user.save();
        return NextResponse.json({ success: true, data: { _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, phone: updatedUser.phone, address: updatedUser.address, avatar: updatedUser.avatar, token: generateToken(updatedUser._id) } }, { status: 200 });
      }
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
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
  if (!userReq || !(await admin(userReq))) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

  try {
    if (route.length > 0) {
      const id = route[0];
      const user = await User.findById(id);
      if (user) {
        await user.deleteOne();
        return NextResponse.json({ success: true, message: 'User removed' }, { status: 200 });
      }
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
  } catch (error) {
     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
}
