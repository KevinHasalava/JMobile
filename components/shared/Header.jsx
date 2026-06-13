"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';


/* ── time-ago helper ─────────────────────────────────── */
const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ── notification icon color map ─────────────────────── */
const NOTIF_COLORS = {
  new_order: '#FF8C00',
  new_contact: '#3B82F6',
  low_stock: '#EF4444',
  order_status_updated: '#10B981',
  payment_approved: '#10B981',
  payment_rejected: '#EF4444',
  general: '#FF8C00',
};
const NOTIF_ICONS = {
  new_order: '🛒',
  new_contact: '✉️',
  low_stock: '⚠️',
  order_status_updated: '📦',
  payment_approved: '✅',
  payment_rejected: '❌',
  general: '🔔',
};

/* ── Notification Panel ──────────────────────────────── */
const NotificationPanel = ({ onClose }) => {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-3 w-96 max-h-[520px] flex flex-col rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/8 animate-notifPop"
      style={{ background: 'rgba(14,15,18,0.98)', backdropFilter: 'blur(24px)', zIndex: 1000 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
        <div>
          <h3 className="font-bold text-white text-base">Notifications</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-[#FF8C00] hover:text-[#FFB347] font-semibold transition-colors"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-red-400 font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="text-5xl mb-4">🔕</div>
            <p className="text-white font-semibold mb-1">No notifications yet</p>
            <p className="text-gray-500 text-sm">You&apos;ll see order updates and alerts here.</p>
          </div>
        ) : (
          notifications.slice(0, 15).map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className="flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-white/3"
              style={{ borderLeft: !n.read ? `3px solid ${NOTIF_COLORS[n.type] || '#FF8C00'}` : '3px solid transparent' }}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">
                {NOTIF_ICONS[n.type] || '🔔'}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold mb-0.5 ${n.read ? 'text-gray-400' : 'text-white'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                <p className="text-[11px] text-gray-600 mt-1">{timeAgo(n.timestamp)}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: NOTIF_COLORS[n.type] || '#FF8C00' }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ═════════════════════════════════════════════════════
   MAIN HEADER
═════════════════════════════════════════════════════ */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [bellAnimate, setBellAnimate] = useState(false);

  const { cart } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { unreadCount } = useNotifications();
  const prevUnread = useRef(unreadCount);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  /* scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* bell shake on new notification */
  useEffect(() => {
    if (unreadCount > prevUnread.current) {
      setBellAnimate(true);
      setTimeout(() => setBellAnimate(false), 900);
    }
    prevUnread.current = unreadCount;
  }, [unreadCount]);

  /* close menus on route change */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
    setIsNotifOpen(false);
  }, [pathname]);

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const navLink = (path, label) => (
    <Link href={path}
      className={`relative text-sm font-semibold transition-colors duration-200 link-underline ${isActive(path)
          ? 'text-[#FF8C00] link-underline active'
          : 'text-gray-400 hover:text-white'
        }`}
    >
      {label}
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'header-glass header-scrolled' : 'header-glass'
        }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <img
              src="/logo.png"
              alt="JM Mobiles"
              className="h-9 w-auto object-contain transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-[0_0_10px_rgba(255,140,0,0.7)]"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-[15px] font-bold text-white leading-tight">JM Mobiles</span>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase leading-tight">Where the future meets tech</span>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────── */}
          <nav className="hidden md:flex items-center gap-8">
            {navLink('/', 'Home')}
            {navLink('/products', 'Products')}
            {navLink('/about', 'About')}
            {navLink('/contact', 'Contact')}
          </nav>

          {/* ── Right Actions ─────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <div className="relative hidden md:block">
              <button
                id="header-search-btn"
                onClick={() => { setIsSearchOpen(!isSearchOpen); setIsUserMenuOpen(false); setIsNotifOpen(false); }}
                className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {isSearchOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      setIsSearchOpen(false);
                      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                      setSearchQuery('');
                    }
                  }}
                  className="absolute right-0 mt-2 w-72 rounded-2xl p-3 animate-notifPop border border-white/8"
                  style={{ background: 'rgba(14,15,18,0.98)', backdropFilter: 'blur(24px)' }}
                >
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/8 focus-within:border-[#FF8C00]/50 transition-colors overflow-hidden px-3">
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search phones, brands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-white py-2.5 text-sm outline-none placeholder-gray-600"
                      autoFocus
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="header-notif-btn"
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsUserMenuOpen(false); setIsSearchOpen(false); }}
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
              {isNotifOpen && <NotificationPanel onClose={() => setIsNotifOpen(false)} />}
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  id="header-user-btn"
                  onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsSearchOpen(false); setIsNotifOpen(false); }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FF6600] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-gray-300 max-w-[100px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden border border-white/8 py-1 animate-notifPop"
                    style={{ background: 'rgba(14,15,18,0.98)', backdropFilter: 'blur(24px)' }}
                  >
                    <div className="px-4 py-3 border-b border-white/6">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {isAdmin() && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-[#FF8C00] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Orders
                    </Link>
                    <button
                      onClick={() => { logout(); setIsUserMenuOpen(false); router.push('/'); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}

            {/* Cart */}
            <button
              id="header-cart-btn"
              onClick={() => router.push('/cart')}
              className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemsCount > 0 && (
                <span className="notif-badge" style={{ background: '#FF8C00' }}>
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────── */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/5 animate-slideInDown">
            {[['/', 'Home'], ['/products', 'Products'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
              <Link key={path}
                href={path}
                className={`flex items-center gap-3 py-3 px-2 rounded-xl text-sm font-semibold transition-colors ${isActive(path) ? 'text-[#FF8C00]' : 'text-gray-400 hover:text-white hover:bg-white/3'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {/* Mobile search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setIsMenuOpen(false);
                  router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                  setSearchQuery('');
                }
              }}
              className="mt-3 flex items-center gap-2 bg-white/5 rounded-xl border border-white/8 px-3"
            >
              <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white py-3 text-sm outline-none placeholder-gray-600"
              />
            </form>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
