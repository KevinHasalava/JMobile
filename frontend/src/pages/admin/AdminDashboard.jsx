import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import { convertAndFormatPrice } from '../../utils/currency';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchDashboardStats(); }, []); // fetchDashboardStats omitted intentionally

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.overview?.totalUsers || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500'
    },
    {
      title: 'Total Products',
      value: stats?.overview?.totalProducts || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500'
    },
    {
      title: 'Total Orders',
      value: stats?.overview?.totalOrders || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500'
    },
    {
      title: 'Total Revenue',
      value: convertAndFormatPrice(stats?.overview?.totalRevenue || 0),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-primary'
    }
  ];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-dark-card border border-dark-border rounded-xl p-6 hover:shadow-glow-orange transition-all animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm mb-1">{card.title}</p>
                  <h3 className="text-3xl font-bold text-text-primary">{card.value}</h3>
                </div>
                <div className={`${card.bgColor} p-4 rounded-xl`}>
                  <div className={card.textColor}>{card.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {stats?.recentOrders?.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:border hover:border-primary/50 transition-all"
                >
                  <div className="flex-1">
                    <p className="text-text-primary font-medium">{order.user?.name || 'Unknown User'}</p>
                    <p className="text-text-muted text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold">{convertAndFormatPrice(order.totalAmount || order.totalPrice)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-500/20 text-green-500'
                          : order.paymentStatus === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {order.paymentStatus || order.status}
                    </span>
                  </div>
                </div>
              ))}
              {!stats?.recentOrders?.length && (
                <p className="text-text-muted text-center py-8">No orders yet</p>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">Top Selling Products</h3>
            <div className="space-y-3">
              {stats?.topProducts?.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-orange rounded-lg flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">
                        {item.productInfo?.name || 'Unknown Product'}
                      </p>
                      <p className="text-text-muted text-sm">{item.totalSold} units sold</p>
                    </div>
                  </div>
                  <p className="text-primary font-bold">{convertAndFormatPrice(item.revenue)}</p>
                </div>
              ))}
              {!stats?.topProducts?.length && (
                <p className="text-text-muted text-center py-8">No sales data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Sales Chart */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h3 className="text-xl font-bold text-text-primary mb-6">Monthly Sales (Last 6 Months)</h3>
          <div className="flex items-end justify-between space-x-2 h-64">
            {stats?.monthlySales?.map((month, index) => {
              const maxSales = Math.max(...(stats?.monthlySales?.map((m) => m.total) || [1]));
              const height = (month.total / maxSales) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <div className="text-text-primary text-sm font-bold mb-2">
                      {convertAndFormatPrice(month.total)}
                    </div>
                    <div
                      className="w-full bg-gradient-orange rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                      title={`${month.count} orders`}
                    ></div>
                  </div>
                  <p className="text-text-muted text-xs mt-2">
                    {monthNames[month._id.month - 1]}
                  </p>
                </div>
              );
            })}
            {!stats?.monthlySales?.length && (
              <p className="text-text-muted text-center w-full py-20">No sales data available</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        {stats?.lowStockProducts?.length > 0 && (
          <div className="bg-dark-card border border-red-500/50 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold text-red-500">Low Stock Alert</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats?.lowStockProducts?.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 bg-dark-bg border border-red-500/30 rounded-lg"
                >
                  <div>
                    <p className="text-text-primary font-medium">{product.name}</p>
                    <p className="text-text-muted text-sm">{product.brand}</p>
                  </div>
                  <span className="text-red-500 font-bold">{product.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
