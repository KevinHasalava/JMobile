import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getMyOrders();
        setOrders(response.data.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-4">
            <span className="w-2 h-8 bg-[#f97316] rounded-full"></span>
            My Orders
          </h1>
          <button 
            onClick={() => navigate('/profile')}
            className="px-5 py-2 bg-[#1a1a1a] border border-gray-700 hover:border-[#f97316] hover:text-[#f97316] text-white rounded-xl transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
              <div className="absolute inset-0 rounded-full border-4 border-[#f97316] border-t-transparent animate-spin" />
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#121212] border border-gray-800 rounded-3xl p-12 text-center">
            <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Orders Yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Looks like you haven't made any purchases yet. Explore our products and find something you love!</p>
            <button 
              onClick={() => navigate('/products')}
              className="px-8 py-3 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white rounded-xl font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-[#121212] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-800/50 pb-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-lg font-bold text-white">
                      Order ID: <span className="text-[#f97316]">#ORD-{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Total Amount</div>
                      <div className="text-xl font-bold text-white">Rs. {order.totalPrice.toFixed(2)}</div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider ${
                      order.orderStatus === 'delivered' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      order.orderStatus === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      {order.orderStatus || (order.isDelivered ? 'Delivered' : 'Processing')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-3">Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white line-clamp-1">{item.name}</div>
                            <div className="text-xs text-gray-400">Qty: {item.quantity} × Rs. {item.price.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-3">Shipping Details</h3>
                    <div className="bg-[#1a1a1a] rounded-xl p-4 text-sm text-gray-300">
                      <p className="font-semibold text-white mb-1">{order.shippingAddress?.fullName}</p>
                      <p>{order.shippingAddress?.street}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                      <p className="mt-2 text-[#f97316]">{order.shippingAddress?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
