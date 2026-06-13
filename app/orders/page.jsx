"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ordersAPI } from '@/services/api';
import { convertAndFormatPrice, getImageUrl } from '@/utils/currency';
import toast from 'react-hot-toast';

/* ── Status Badge ─────────────────────────────────────────────────── */
const STATUS_STYLES = {
  pending:    'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  shipped:    'bg-purple-500/15 text-purple-400 border-purple-500/30',
  delivered:  'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled:  'bg-red-500/15 text-red-400 border-red-500/30',
};

const PAYMENT_STYLES = {
  pending:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  paid:     'bg-green-500/15 text-green-400 border-green-500/30',
  failed:   'bg-red-500/15 text-red-400 border-red-500/30',
  refunded: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

const STATUS_ICONS = {
  pending:    '🕐',
  processing: '⚙️',
  shipped:    '🚚',
  delivered:  '✅',
  cancelled:  '❌',
};

function StatusBadge({ status, type = 'order' }) {
  const styles = type === 'payment' ? PAYMENT_STYLES : STATUS_STYLES;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
      {type === 'order' && <span>{STATUS_ICONS[status] || '🕐'}</span>}
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
    </span>
  );
}

/* ── Order Detail Modal ───────────────────────────────────────────── */
function OrderModal({ order, onClose }) {
  const items = order.items || order.orderItems || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div>
            <h3 className="text-lg font-bold text-white">Order #{order._id?.slice(-8).toUpperCase()}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleString('en-LK', { dateStyle: 'long', timeStyle: 'short' })}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Row */}
          <div className="flex flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Order Status</p>
              <StatusBadge status={order.orderStatus || order.status} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Payment Status</p>
              <StatusBadge status={order.paymentStatus} type="payment" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Payment Method</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30">
                {order.paymentMethod || 'N/A'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Items Ordered</h4>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                  <img
                    src={getImageUrl(item.image || item.images?.[0])}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border border-white/8 flex-shrink-0"
                    onError={e => { e.target.src = '/placeholder.png'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-[#f97316] flex-shrink-0">{convertAndFormatPrice(item.price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white/3 rounded-xl border border-white/5 p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#f97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Address
              </h4>
              <div className="text-sm text-gray-400 space-y-0.5">
                <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
                {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.zipCode}</p>
                {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white/3 rounded-xl border border-white/5 p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{convertAndFormatPrice(order.itemsPrice || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{order.shippingPrice > 0 ? convertAndFormatPrice(order.shippingPrice) : <span className="text-green-400">Free</span>}</span>
              </div>
              {order.taxPrice > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Tax</span>
                  <span>{convertAndFormatPrice(order.taxPrice)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-white/8 pt-2 mt-2">
                <span className="text-white">Total</span>
                <span className="text-[#f97316]">{convertAndFormatPrice(order.totalAmount || order.totalPrice || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */
export default function MyOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getMyOrders();
      const data = res.data?.data || res.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load your orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => (o.orderStatus || o.status) === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Orders</h1>
            <p className="text-gray-500 mt-1 text-sm">Track and review all your purchases</p>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#f97316] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            My Profile
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                filter === f.value
                  ? 'bg-[#f97316] border-[#f97316] text-white shadow-[0_0_16px_rgba(249,115,22,0.35)]'
                  : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white bg-white/3'
              }`}
            >
              {f.label}
              {f.value === 'all' && orders.length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({orders.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full border-4 border-[#f97316]/20 border-t-[#f97316] animate-spin mb-4"></div>
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-5">{filter === 'all' ? '🛒' : STATUS_ICONS[filter] || '📦'}</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {filter === 'all'
                ? "Looks like you haven't placed any orders. Start shopping!"
                : `You don't have any ${filter} orders right now.`}
            </p>
            {filter === 'all' && (
              <Link
                href="/products"
                className="px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)] hover:shadow-[0_0_28px_rgba(249,115,22,0.5)]"
              >
                Browse Products
              </Link>
            )}
          </div>
        )}

        {/* Orders List */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map(order => {
              const items = order.items || order.orderItems || [];
              const firstItem = items[0];
              const status = order.orderStatus || order.status || 'pending';
              const total = order.totalAmount || order.totalPrice || 0;

              return (
                <div
                  key={order._id}
                  className="bg-[#111] border border-white/8 rounded-2xl p-5 hover:border-[#f97316]/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* First Product Thumb */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img
                          src={getImageUrl(firstItem?.image || firstItem?.images?.[0])}
                          alt={firstItem?.name || 'Product'}
                          className="w-16 h-16 rounded-xl object-cover border border-white/8"
                          onError={e => { e.target.src = '/placeholder.png'; }}
                        />
                        {items.length > 1 && (
                          <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#f97316] text-white text-[10px] font-bold flex items-center justify-center">
                            +{items.length - 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 mb-1">
                          Order #{order._id?.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-white font-medium truncate">
                          {firstItem?.name || 'Order'}
                          {items.length > 1 && <span className="text-gray-500"> & {items.length - 1} more</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <StatusBadge status={status} />
                          <StatusBadge status={order.paymentStatus} type="payment" />
                        </div>
                      </div>
                    </div>

                    {/* Right: Price + Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                      <p className="text-lg font-bold text-[#f97316]">{convertAndFormatPrice(total)}</p>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 text-sm font-semibold rounded-xl border border-[#f97316]/30 text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
