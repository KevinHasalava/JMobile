import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import AdminNotificationPanel from './AdminNotificationPanel';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(true);
  const [isNotifOpen,    setIsNotifOpen]    = useState(false);
  const [bellAnimate,    setBellAnimate]    = useState(false);
  const location  = useNavigate() && useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount }  = useNotifications();
  const prevUnread = useRef(unreadCount);

  /* bell shake on new notification */
  useEffect(() => {
    if (unreadCount > prevUnread.current) {
      setBellAnimate(true);
      setTimeout(() => setBellAnimate(false), 900);
    }
    prevUnread.current = unreadCount;
  }, [unreadCount]);

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      label: 'Dashboard',
    },
    {
      path: '/admin/products',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
      label: 'Products',
    },
    {
      path: '/admin/users',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      label: 'Users',
    },
    {
      path: '/admin/orders',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
      label: 'Orders',
    },
    {
      path: '/admin/payments',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      label: 'Payments',
    },
    {
      path: '/admin/chat',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
      label: 'Live Chat',
    },
    {
      path: '/admin/inquiries',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      label: 'Inquiries',
    },
  ];

  const currentPage = menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel';

  return (
    <div className="min-h-screen flex" style={{ background: '#0B0C10' }}>
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} fixed h-full z-30 flex flex-col transition-all duration-300 border-r`}
        style={{
          background: 'rgba(14,15,18,0.98)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 flex-shrink-0 border-b border-white/6">
          {isSidebarOpen ? (
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF8C00] to-[#FF6600] flex items-center justify-center shadow-[0_0_12px_rgba(255,140,0,0.4)]">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-white leading-tight">JM Admin</p>
                <p className="text-[10px] text-gray-500 leading-tight">Control Panel</p>
              </div>
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF8C00] to-[#FF6600] flex items-center justify-center mx-auto shadow-[0_0_12px_rgba(255,140,0,0.4)]">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!isSidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/20 shadow-[0_2px_8px_rgba(255,140,0,0.15)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isSidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-white/6 flex-shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {isSidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 flex flex-col min-h-screen`}>

        {/* Top Bar */}
        <header
          className="h-16 px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-20 border-b"
          style={{
            background: 'rgba(14,15,18,0.97)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <div>
            <h1 className="text-lg font-black text-white">{currentPage}</h1>
            <div className="flex items-center gap-2">
              <span className="live-indicator text-xs">System Online</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="admin-notif-btn"
                onClick={() => setIsNotifOpen(true)}
                className={`p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all relative ${bellAnimate ? 'animate-bell' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge animate-badge-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Admin Avatar */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/8">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500 leading-tight">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8C00] to-[#FF6600] flex items-center justify-center shadow-[0_0_12px_rgba(255,140,0,0.35)]">
                <span className="text-white font-black text-sm">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Notification Panel */}
      <AdminNotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
