import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

/* ── time-ago helper ─────────────────────────────────── */
const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ── type meta ───────────────────────────────────────── */
const TYPE_META = {
  new_order:            { icon: '🛒', color: '#FF8C00', label: 'Order',   route: '/admin/orders'    },
  new_contact:          { icon: '✉️', color: '#3B82F6', label: 'Inquiry',  route: '/admin/inquiries' },
  low_stock:            { icon: '⚠️', color: '#EF4444', label: 'Stock',    route: '/admin/products'  },
  order_status_updated: { icon: '📦', color: '#10B981', label: 'Order',   route: '/admin/orders'    },
  payment_approved:     { icon: '✅', color: '#10B981', label: 'Payment',  route: '/admin/payments'  },
  payment_rejected:     { icon: '❌', color: '#EF4444', label: 'Payment',  route: '/admin/payments'  },
  general:              { icon: '🔔', color: '#FF8C00', label: 'General', route: null               },
};

const TABS = ['All', 'Orders', 'Inquiries', 'Stock'];

const matchTab = (n, tab) => {
  if (tab === 'All') return true;
  if (tab === 'Orders')    return ['new_order','order_status_updated','payment_approved','payment_rejected'].includes(n.type);
  if (tab === 'Inquiries') return n.type === 'new_contact';
  if (tab === 'Stock')     return n.type === 'low_stock';
  return true;
};

/* ═════════════════════════════════════════════════════
   ADMIN NOTIFICATION PANEL
═════════════════════════════════════════════════════ */
const AdminNotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [activeTab, setActiveTab] = React.useState('All');
  const navigate  = useNavigate();
  const panelRef  = useRef(null);

  /* close on outside click */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const filtered = notifications.filter(n => matchTab(n, activeTab));

  const handleItemClick = (n) => {
    markRead(n.id);
    const meta = TYPE_META[n.type] || TYPE_META.general;
    if (meta.route) navigate(meta.route);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="notification-panel z-50 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
        style={{ top: 0, right: 0 }}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-white/6 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-white">Notifications</h2>
              <span className="live-indicator">Live</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/8 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-[#FF8C00] font-semibold hover:text-[#FFB347] transition-colors">
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-xs text-gray-600 font-medium hover:text-red-400 transition-colors">
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {TABS.map(tab => {
              const count = notifications.filter(n => matchTab(n, tab) && !n.read).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/25'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {tab}
                  {count > 0 && (
                    <span className="bg-[#FF8C00] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
              <div className="text-6xl mb-4">
                {activeTab === 'Orders' ? '📦' : activeTab === 'Inquiries' ? '✉️' : activeTab === 'Stock' ? '📊' : '🔕'}
              </div>
              <p className="text-white font-bold text-base mb-1">No {activeTab === 'All' ? '' : activeTab.toLowerCase()} notifications</p>
              <p className="text-gray-500 text-sm">Real-time alerts will appear here.</p>
            </div>
          ) : (
            <div>
              {filtered.map((n, idx) => {
                const meta = TYPE_META[n.type] || TYPE_META.general;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className="notification-item animate-fadeIn"
                    style={{
                      borderLeftColor: !n.read ? meta.color : 'transparent',
                      animationDelay: `${idx * 30}ms`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}20` }}
                      >
                        {meta.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-bold leading-tight ${n.read ? 'text-gray-400' : 'text-white'}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: meta.color }} />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                            style={{ background: `${meta.color}15`, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[11px] text-gray-600">{timeAgo(n.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 flex-shrink-0">
          <p className="text-xs text-gray-600 text-center">
            Showing last {Math.min(filtered.length, 50)} notifications • Auto-cleared after 7 days
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminNotificationPanel;
