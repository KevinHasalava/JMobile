import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  read: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  replied: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const STATUS_LABELS = { new: 'New', read: 'Read', replied: 'Replied' };

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ new: 0, replied: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await api.get(
        `/contact?${params}`,
        { headers }
      );
      if (res.data.success) {
        setInquiries(res.data.data);
        setStats(res.data.stats);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.put(
        `/contact/${id}`,
        { status: newStatus },
        { headers }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setInquiries((prev) =>
          prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus } : inq))
        );
        setStats((prev) => {
          const old = inquiries.find((i) => i._id === id)?.status;
          const updated = { ...prev };
          if (old === 'new') updated.new = Math.max(0, updated.new - 1);
          if (old === 'replied') updated.replied = Math.max(0, updated.replied - 1);
          if (newStatus === 'new') updated.new += 1;
          if (newStatus === 'replied') updated.replied += 1;
          return updated;
        });
        if (selectedInquiry?._id === id) {
          setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await api.delete(
        `/contact/${id}`,
        { headers }
      );
      if (res.data.success) {
        toast.success('Inquiry deleted');
        setInquiries((prev) => prev.filter((inq) => inq._id !== id));
        setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        if (selectedInquiry?._id === id) setSelectedInquiry(null);
      }
    } catch {
      toast.error('Failed to delete inquiry');
    } finally {
      setDeletingId(null);
    }
  };

  const openDetail = async (inq) => {
    setSelectedInquiry(inq);
    // Auto-mark as read when opened
    if (inq.status === 'new') {
      handleStatusChange(inq._id, 'read');
    }
  };

  const statCards = [
    {
      label: 'Total Messages',
      value: stats.total,
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      color: 'text-primary',
      bg: 'bg-[#FF8C00]/10',
    },
    {
      label: 'Unread',
      value: stats.new,
      icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Replied',
      value: stats.replied,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Customer Inquiries</h2>
            <p className="text-gray-400 text-sm mt-1">
              Messages submitted via the Contact page
            </p>
          </div>
          <button
            onClick={fetchInquiries}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF8C00]/10 text-[#FF8C00] border border-[#FF8C00]/20 rounded-lg hover:bg-[#FF8C00]/20 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center gap-4"
            >
              <div className={`${card.bg} p-3 rounded-xl`}>
                <svg className={`w-6 h-6 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-xs">{card.label}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, subject..."
              className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-[#FF8C00] transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#FF8C00] transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        {/* Table + Detail Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Table */}
          <div className="xl:col-span-2 bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            ) : inquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">No inquiries found</p>
                <p className="text-sm mt-1">Messages from your Contact page will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-border bg-dark-bg/50">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Sender</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {inquiries.map((inq) => (
                      <tr
                        key={inq._id}
                        onClick={() => openDetail(inq)}
                        className={`cursor-pointer transition-colors hover:bg-dark-bg/60 ${
                          selectedInquiry?._id === inq._id ? 'bg-dark-bg' : ''
                        } ${inq.status === 'new' ? 'border-l-2 border-blue-500' : ''}`}
                      >
                        <td className="px-5 py-4">
                          <p className="text-white font-medium text-sm">{inq.name}</p>
                          <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[140px]">{inq.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-gray-300 text-sm truncate max-w-[160px]">{inq.subject}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[inq.status]}`}>
                            {STATUS_LABELS[inq.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(inq.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </td>
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <select
                              value={inq.status}
                              onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                              className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-[#FF8C00] transition-colors"
                            >
                              <option value="new">New</option>
                              <option value="read">Read</option>
                              <option value="replied">Replied</option>
                            </select>
                            <button
                              onClick={() => handleDelete(inq._id)}
                              disabled={deletingId === inq._id}
                              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-dark-border">
                <p className="text-gray-400 text-sm">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-white disabled:opacity-40 hover:border-primary transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-white disabled:opacity-40 hover:border-primary transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col">
            {selectedInquiry ? (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-white text-lg">{selectedInquiry.name}</h3>
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="text-[#FF8C00] text-sm hover:underline"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Subject</p>
                    <p className="text-white font-medium">{selectedInquiry.subject}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Message</p>
                    <div className="bg-dark-bg rounded-xl p-4 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap border border-dark-border">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Received</p>
                      <p className="text-gray-300 text-sm">
                        {new Date(selectedInquiry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[selectedInquiry.status]}`}>
                      {STATUS_LABELS[selectedInquiry.status]}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                    onClick={() => handleStatusChange(selectedInquiry._id, 'replied')}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#FF8C00] to-[#FF7A00] text-white font-semibold py-2.5 rounded-xl hover:shadow-glow-orange transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Reply via Email
                  </a>
                  <button
                    onClick={() => handleDelete(selectedInquiry._id)}
                    className="flex items-center justify-center gap-2 w-full bg-red-500/10 text-red-500 border border-red-500/20 font-semibold py-2.5 rounded-xl hover:bg-red-500/20 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Inquiry
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-gray-600">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-center">Click an inquiry to view full details and reply</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInquiries;
