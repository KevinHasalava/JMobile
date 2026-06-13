"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/currency';
import { convertAndFormatPrice } from '@/utils/currency';

const AdminPayments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slipFilter, setSlipFilter] = useState('pending');
  const [pagination, setPagination] = useState({ currentPage: 1, pages: 1, total: 0 });
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slipFilter, pagination.currentPage]); // fetchPayments omitted intentionally

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = (typeof window !== "undefined" ? localStorage.getItem('token') : null);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 15
      });

      if (slipFilter !== 'all') {
        params.append('slipStatus', slipFilter);
      }

      const response = await api.get(
        `/admin/orders?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Filter only bank_transfer locally if backend doesn't filter paymentMethod
      // The backend gets all orders by slipStatus, but only bank_transfers have bank slips anyway
      const bankOrders = response.data.data.filter(o => o.paymentMethod === 'bank_transfer');

      setOrders(bankOrders);
      setPagination({
        currentPage: response.data.currentPage,
        pages: response.data.pages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (action) => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const token = (typeof window !== "undefined" ? localStorage.getItem('token') : null);
      await api.put(
        `/admin/orders/${selectedOrder._id}/verify-slip`,
        { action, rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Bank slip ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      setRejectionReason('');
      fetchPayments();
    } catch (error) {
      console.error('Error verifying slip:', error);
      toast.error(error.response?.data?.message || 'Error verifying bank slip');
    } finally {
      setActionLoading(false);
    }
  };

  const viewSlip = (order) => {
    setSelectedOrder(order);
    setRejectionReason('');
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Payment Verification</h2>
            <p className="text-gray-400 mt-1">Review and approve bank transfer slips</p>
          </div>
          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-text-primary hover:text-primary transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => { setSlipFilter(status); setPagination(p => ({ ...p, currentPage: 1 })); }}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                slipFilter === status
                  ? 'bg-gradient-orange text-white shadow-glow-orange font-medium'
                  : 'bg-dark-bg text-gray-400 hover:text-white border border-dark-border'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">No bank transfer payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-dark-bg/50 border-b border-dark-border text-gray-400 text-sm">
                    <th className="p-4 font-medium">Order ID</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Depositor</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-dark-bg/40 transition-colors">
                      <td className="p-4 text-sm font-mono text-gray-300">
                        {order._id.substring(order._id.length - 8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm font-medium">{order.user?.name || order.shippingAddress.fullName}</p>
                        <p className="text-gray-500 text-xs">{order.user?.email}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        {order.bankSlip?.depositorName || '-'}
                      </td>
                      <td className="p-4 text-sm font-semibold text-primary">
                        {convertAndFormatPrice(order.totalPrice)}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.bankSlipStatus)}`}>
                          {order.bankSlipStatus ? order.bankSlipStatus.toUpperCase() : 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => viewSlip(order)}
                          className="px-4 py-1.5 bg-[#FF8C00]/10 text-[#FF8C00] border border-[#FF8C00]/20 rounded hover:bg-[#FF8C00]/20 transition-colors text-sm"
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
            
            {/* Left: Slip Image Viewer */}
            <div className="w-full md:w-3/5 bg-black/50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-dark-border min-h-[300px]">
              {selectedOrder.bankSlip?.path ? (
                selectedOrder.bankSlip.path.endsWith('.pdf') ? (
                  <iframe 
                    src={getImageUrl(selectedOrder.bankSlip.path)} 
                    className="w-full h-[500px] rounded"
                    title="Bank Slip PDF"
                  />
                ) : (
                  <img
                    src={getImageUrl(selectedOrder.bankSlip.path)}
                    alt="Bank Slip"
                    className="max-w-full max-h-[70vh] object-contain rounded"
                  />
                )
              ) : (
                <div className="text-gray-500 flex flex-col items-center">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p>No slip image attached</p>
                </div>
              )}
            </div>

            {/* Right: Details & Actions */}
            <div className="w-full md:w-2/5 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Verify Payment</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Details</p>
                  <p className="text-white font-mono text-sm mb-1">ID: {selectedOrder._id}</p>
                  <p className="text-white text-sm mb-1">Total: <span className="text-primary font-bold">{convertAndFormatPrice(selectedOrder.totalPrice)}</span></p>
                  <p className="text-gray-400 text-sm">Customer: {selectedOrder.user?.name || selectedOrder.shippingAddress.fullName}</p>
                </div>

                <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Slip Details</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-400">Depositor:</span>
                    <span className="text-white font-medium">{selectedOrder.bankSlip?.depositorName || 'N/A'}</span>
                    
                    <span className="text-gray-400">Ref ID:</span>
                    <span className="text-white font-medium">{selectedOrder.bankSlip?.transactionId || 'N/A'}</span>
                    
                    <span className="text-gray-400">Current Status:</span>
                    <span className={`font-bold capitalize ${
                      selectedOrder.bankSlipStatus === 'approved' ? 'text-green-500' :
                      selectedOrder.bankSlipStatus === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                    }`}>{selectedOrder.bankSlipStatus || 'Pending'}</span>
                  </div>
                </div>

                {selectedOrder.bankSlipStatus === 'rejected' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Rejection Reason</p>
                    <p className="text-red-300 text-sm">{selectedOrder.bankSlipRejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Actions Area */}
              {selectedOrder.bankSlipStatus === 'pending' && (
                <div className="mt-6 pt-6 border-t border-dark-border space-y-4">
                  <button
                    onClick={() => handleVerify('approve')}
                    disabled={actionLoading}
                    className="w-full bg-green-500/20 text-green-500 border border-green-500/50 py-3 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Approve Payment'}
                  </button>
                  
                  <div className="pt-2">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Reason for rejection (required to reject)"
                      className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-white focus:border-red-500 outline-none resize-none h-20 mb-2"
                    />
                    <button
                      onClick={() => handleVerify('reject')}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="w-full bg-red-500/10 text-red-500 border border-red-500/30 py-3 rounded-xl font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      Reject Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPayments;
