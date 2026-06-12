import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import { convertAndFormatPrice } from '../../utils/currency';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, pages: 1, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pagination.currentPage]); // fetchOrders omitted intentionally

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10
      });

      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(
        `/admin/orders?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(response.data.data);
      setPagination({
        currentPage: response.data.currentPage,
        pages: response.data.pages,
        total: response.data.total
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, orderStatus, paymentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/admin/orders/${orderId}/status`,
        { orderStatus, paymentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      processing: 'bg-blue-500/20 text-blue-500',
      shipped: 'bg-purple-500/20 text-purple-500',
      delivered: 'bg-green-500/20 text-green-500',
      cancelled: 'bg-red-500/20 text-red-500',
      paid: 'bg-green-500/20 text-green-500',
      failed: 'bg-red-500/20 text-red-500',
      refunded: 'bg-gray-500/20 text-gray-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Orders & Payments</h2>
            <p className="text-text-muted">Manage customer orders and payment records</p>
          </div>
          <div className="text-text-primary bg-dark-card border border-dark-border px-6 py-3 rounded-lg">
            Total Orders: <span className="font-bold text-primary">{pagination.total}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === ''
                  ? 'bg-gradient-orange text-white'
                  : 'bg-dark-bg text-text-secondary hover:text-primary'
              }`}
            >
              All
            </button>
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-gradient-orange text-white'
                    : 'bg-dark-bg text-text-secondary hover:text-primary'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg border-b border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Payment Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase">Order Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-dark-bg transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-primary font-mono text-sm">
                        #{order._id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-text-primary font-medium">
                        {order.user?.name || 'Unknown User'}
                      </div>
                      <div className="text-text-muted text-sm">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-primary font-bold">
                        {convertAndFormatPrice(order.totalAmount || order.totalPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.paymentStatus || 'pending')}`}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.orderStatus || order.status || 'pending')}`}>
                        {order.orderStatus || order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-text-muted text-lg">No orders found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-text-muted">
              Page {pagination.currentPage} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
              disabled={pagination.currentPage === pagination.pages}
              className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card border border-dark-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-text-primary">
                    Order #{selectedOrder._id.slice(-8)}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Customer Info */}
                <div className="bg-dark-bg p-4 rounded-lg mb-4">
                  <h4 className="text-text-primary font-semibold mb-2">Customer Information</h4>
                  <p className="text-text-secondary">Name: {selectedOrder.user?.name}</p>
                  <p className="text-text-secondary">Email: {selectedOrder.user?.email}</p>
                  <p className="text-text-secondary">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="bg-dark-bg p-4 rounded-lg mb-4">
                    <h4 className="text-text-primary font-semibold mb-2">Shipping Address</h4>
                    <p className="text-text-secondary">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-text-secondary">{selectedOrder.shippingAddress.phone}</p>
                    <p className="text-text-secondary">
                      {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}
                    </p>
                    <p className="text-text-secondary">
                      {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p className="text-text-secondary">{selectedOrder.shippingAddress.country}</p>
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-dark-bg p-4 rounded-lg mb-4">
                  <h4 className="text-text-primary font-semibold mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {(selectedOrder.items || selectedOrder.orderItems || []).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-dark-card rounded">
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <p className="text-text-primary">{item.name}</p>
                            <p className="text-text-muted text-sm">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-primary font-bold">{convertAndFormatPrice(item.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-dark-bg p-4 rounded-lg mb-4">
                  <h4 className="text-text-primary font-semibold mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-text-secondary">
                      <span>Subtotal:</span>
                      <span>{convertAndFormatPrice(selectedOrder.itemsPrice || 0)}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Shipping:</span>
                      <span>{convertAndFormatPrice(selectedOrder.shippingPrice || 0)}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Tax:</span>
                      <span>{convertAndFormatPrice(selectedOrder.taxPrice || 0)}</span>
                    </div>
                    <div className="flex justify-between text-text-primary font-bold text-lg border-t border-dark-border pt-2">
                      <span>Total:</span>
                      <span className="text-primary">{convertAndFormatPrice(selectedOrder.totalAmount || selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Update Status */}
                <div className="bg-dark-bg p-4 rounded-lg">
                  <h4 className="text-text-primary font-semibold mb-3">Update Status</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary text-sm mb-2">Order Status</label>
                      <select
                        defaultValue={selectedOrder.orderStatus || selectedOrder.status || 'pending'}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          handleStatusUpdate(
                            selectedOrder._id,
                            newStatus,
                            selectedOrder.paymentStatus
                          );
                        }}
                        className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-text-secondary text-sm mb-2">Payment Status</label>
                      <select
                        defaultValue={selectedOrder.paymentStatus || 'pending'}
                        onChange={(e) => {
                          const newPaymentStatus = e.target.value;
                          handleStatusUpdate(
                            selectedOrder._id,
                            selectedOrder.orderStatus || selectedOrder.status,
                            newPaymentStatus
                          );
                        }}
                        className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
