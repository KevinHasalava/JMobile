"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

import toast from 'react-hot-toast';
import api, { ordersAPI } from '@/services/api';
import { getImageUrl, convertAndFormatPrice } from '@/utils/currency';
import axios from 'axios';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    street: '',
    city: '',
    zipCode: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  const [stats, setStats] = useState([
    { label: 'Total Orders', value: '0' },
    { label: 'Wishlist Items', value: '0' },
    { label: 'Loyalty Points', value: '0' },
  ]);

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await ordersAPI.getMyOrders();
        const ordersArray = data.data || [];

        const totalOrders = ordersArray.length;
        const totalSpent = ordersArray.reduce((acc, order) => acc + order.totalPrice, 0);
        const loyaltyPoints = Math.floor(totalSpent / 100);

        setStats([
          { label: 'Total Orders', value: totalOrders.toString() },
          { label: 'Wishlist Items', value: '0' },
          { label: 'Loyalty Points', value: loyaltyPoints.toString() },
        ]);

          const formattedOrders = ordersArray.slice(0, 5).map(order => ({
            id: `#ORD-${order._id.substring(order._id.length - 6).toUpperCase()}`,
            date: new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
            status: order.orderStatus || order.status || 'Pending',
            total: convertAndFormatPrice(order.totalAmount || order.totalPrice || 0)
        }));
        setRecentOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        zipCode: user.address?.zipCode || '',
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });
      fetchDashboardData();
    }
  }, [user]);

  const handleLogout = () => {
    if (logout) logout();
    router.push('/login');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setFormData(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
    }
  };

  const handleSave = async () => {
    if (formData.password && !formData.currentPassword) {
      return toast.error('Current password is required to set a new password!');
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match!');
    }

    setLoading(true);
    let finalAvatarUrl = formData.avatar;

    if (avatarFile) {
      const uploadData = new FormData();
      uploadData.append('avatar', avatarFile);
      try {
        const uploadRes = await api.post('/upload/avatar', uploadData);
        if (uploadRes.data.success) {
          finalAvatarUrl = uploadRes.data.data.path;
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to upload avatar');
        setLoading(false);
        return;
      }
    }

    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: finalAvatarUrl,
      address: {
        street: formData.street,
        city: formData.city,
        state: user?.address?.state || '',
        zipCode: formData.zipCode,
        country: user?.address?.country || '',
      }
    };

    if (formData.password) {
      updateData.currentPassword = formData.currentPassword;
      updateData.password = formData.password;
    }

    const result = await updateProfile(updateData);
    setLoading(false);

    if (result.success) {
      toast.success('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setAvatarFile(null);
      setIsEditing(false);
    } else {
      toast.error(result.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">

        {/* Dynamic Profile Avatar Header */}
        <div className="mb-10 flex flex-col md:flex-row items-center gap-6 bg-[#121212]/50 p-6 rounded-3xl border border-gray-800 backdrop-blur-sm">
          <div className="relative group cursor-pointer" onClick={() => isEditing && fileInputRef.current?.click()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {/* Glowing neon border wrapper */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f97316] to-[#ea580c] rounded-full blur opacity-70 group-hover:opacity-100 transition duration-500"></div>

            {/* Avatar Image */}
            <div className="relative w-28 h-28 rounded-full bg-[#1a1a1a] border-2 border-[#121212] overflow-hidden flex items-center justify-center text-4xl font-bold text-[#f97316]">
              {formData.avatar ? (
                <img
                  src={getImageUrl(formData.avatar)}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                formData.name ? formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
              )}
            </div>

            {/* Camera Edit Badge */}
            {isEditing && (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#f97316] rounded-full border-2 border-[#121212] flex items-center justify-center shadow-lg hover:bg-[#ea580c] transition-colors z-10">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}

            {/* Remove Avatar Badge */}
            {isEditing && formData.avatar && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setAvatarFile(null);
                  setFormData(prev => ({ ...prev, avatar: '' }));
                }}
                className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full border-2 border-[#121212] flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                title="Remove Avatar"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{formData.name || 'User Name'}</h1>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <div className="inline-block px-4 py-1.5 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 text-[#f97316] text-sm font-semibold tracking-wide">
              Premium Elite Member
            </div>
            {isEditing && (
              <p className="text-sm text-gray-400 mt-3 animate-fadeIn">Click on the avatar image to upload a new one.</p>
            )}
          </div>

          <div className="md:ml-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-medium hover:bg-red-500 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="bg-[#121212] border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-2 h-6 bg-[#f97316] rounded-full"></span>
                  Personal Details
                </h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-[#f97316] hover:text-[#ea580c] text-sm font-semibold flex items-center gap-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                  <input type="text" disabled={!isEditing} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] disabled:opacity-50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                  <input type="email" disabled={!isEditing} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] disabled:opacity-50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                  <input type="tel" disabled={!isEditing} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] disabled:opacity-50 transition-all" />
                </div>
                <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-800/50">
                  <h4 className="text-md font-semibold mb-4 text-gray-300">Shipping Information</h4>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Shipping Address</label>
                  <input type="text" disabled={!isEditing} value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] disabled:opacity-50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">City</label>
                  <input type="text" disabled={!isEditing} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] disabled:opacity-50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Postal Code</label>
                  <input type="text" disabled={!isEditing} value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] disabled:opacity-50 transition-all" />
                </div>
              </div>

              {/* Password & Security Section */}
              <div className="mt-8 pt-8 border-t border-gray-800/50">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-2 h-6 bg-[#f97316] rounded-full"></span>
                  Security & Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">Current Password (Required for updates)</label>
                    <input type="password" disabled={!isEditing} placeholder="Enter your current password" value={formData.currentPassword} onChange={e => setFormData({ ...formData, currentPassword: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] disabled:opacity-50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">New Password</label>
                    <input type="password" disabled={!isEditing} placeholder="Leave blank to keep current" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] disabled:opacity-50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                    <input type="password" disabled={!isEditing} placeholder="Confirm new password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] disabled:opacity-50 transition-all" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="mt-8 pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row gap-4 animate-fadeIn">
                  <button onClick={handleSave} disabled={loading} className="flex-1 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white py-3.5 px-6 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none">
                    {loading ? 'Saving Changes...' : 'Save All Changes'}
                  </button>
                  <button onClick={() => {
                    setIsEditing(false);
                    setFormData({ ...formData, currentPassword: '', password: '', confirmPassword: '' });
                  }} className="px-10 py-3.5 bg-[#1a1a1a] border border-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 hover:border-gray-600 transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Analytics & Activity */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">

            {/* Stats Cards (Glassmorphism + Orange top border) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-[#121212]/60 backdrop-blur-md border border-gray-800 border-t-2 border-t-[#f97316] rounded-2xl p-6 flex flex-col lg:flex-row items-center lg:justify-between hover:bg-[#1a1a1a]/80 transition-all shadow-lg shadow-black/20">
                  <span className="text-gray-400 font-medium">{stat.label}</span>
                  <span className="text-3xl lg:text-2xl font-bold text-white mt-2 lg:mt-0">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-[#121212] border border-gray-800 rounded-3xl p-6 overflow-hidden">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <span className="w-2 h-5 bg-[#f97316] rounded-full"></span>
                Recent Orders
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[300px]">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                      <th className="pb-4 font-semibold px-2">Order</th>
                      <th className="pb-4 font-semibold px-2">Status</th>
                      <th className="pb-4 font-semibold px-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {recentOrders.map((order, i) => (
                      <tr key={i} className="hover:bg-[#1a1a1a] transition-colors group">
                        <td className="py-4 px-2">
                          <div className="text-white font-medium text-sm">{order.id}</div>
                          <div className="text-gray-500 text-xs mt-1">{order.date}</div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right font-bold text-white text-sm">
                          {order.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => router.push('/orders')} className="w-full mt-4 py-3 bg-[#1a1a1a] border border-gray-800 text-[#f97316] rounded-xl text-sm font-semibold hover:bg-gray-800 hover:border-gray-700 transition-colors">
                View All Orders →
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
