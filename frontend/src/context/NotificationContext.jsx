import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

/* ── helpers ─────────────────────────────────────────── */
const STORAGE_KEY = 'jm_notifications';
const MAX_NOTIFS  = 50;
const TTL_MS      = 7 * 24 * 60 * 60 * 1000; // 7 days

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    const cutoff = Date.now() - TTL_MS;
    return items.filter(n => new Date(n.timestamp).getTime() > cutoff);
  } catch { return []; }
};

const saveToStorage = (items) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_NOTIFS))); }
  catch { /* quota */ }
};

/* ── notification icon/color map ─────────────────────── */
const TYPE_META = {
  new_order:            { icon: '🛒', color: '#FF8C00', title: 'New Order Received'   },
  new_contact:          { icon: '✉️', color: '#3B82F6', title: 'New Inquiry Received' },
  low_stock:            { icon: '⚠️', color: '#EF4444', title: 'Low Stock Alert'       },
  order_status_updated: { icon: '📦', color: '#10B981', title: 'Order Status Updated'  },
  payment_approved:     { icon: '✅', color: '#10B981', title: 'Payment Approved'       },
  payment_rejected:     { icon: '❌', color: '#EF4444', title: 'Payment Rejected'       },
  general:              { icon: '🔔', color: '#FF8C00', title: 'Notification'           },
};

/* ── custom toast renderer ───────────────────────────── */
const showNotifToast = (notification) => {
  const meta = TYPE_META[notification.type] || TYPE_META.general;
  toast.custom(
    (t) => (
      <div
        onClick={() => toast.dismiss(t.id)}
        style={{
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateX(0)' : 'translateX(110%)',
          transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          background: 'rgba(14,15,18,0.97)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${meta.color}30`,
          borderLeft: `3px solid ${meta.color}`,
          borderRadius: '14px',
          padding: '14px 16px',
          maxWidth: '360px',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ fontSize: '22px', flexShrink: 0 }}>{meta.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: '#F0F0F0', fontSize: '14px', marginBottom: '2px' }}>
            {notification.title || meta.title}
          </p>
          <p style={{ color: '#A0A0A8', fontSize: '13px', lineHeight: 1.4 }}>
            {notification.message}
          </p>
        </div>
        <button
          style={{ color: '#5A5A68', fontSize: '18px', lineHeight: 1, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
        >×</button>
      </div>
    ),
    { duration: 6000, position: 'top-right' }
  );
};

/* ═════════════════════════════════════════════════════
   PROVIDER
═════════════════════════════════════════════════════ */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(loadFromStorage);
  const [isPanelOpen,   setIsPanelOpen]   = useState(false);
  const socketRef = useRef(null);

  /* persist on change */
  useEffect(() => { saveToStorage(notifications); }, [notifications]);

  /* ── add a notification ─────────────────────────── */
  const addNotification = useCallback((type, title, message, meta = {}) => {
    const notif = {
      id:        `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      type,
      title:     title || TYPE_META[type]?.title || 'Notification',
      message,
      meta,
      read:      false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev].slice(0, MAX_NOTIFS));
    showNotifToast(notif);
    return notif;
  }, []);

  /* ── mark single as read ────────────────────────── */
  const markRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  /* ── mark all read ──────────────────────────────── */
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  /* ── clear all ──────────────────────────────────── */
  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /* ── register socket (called by SocketContext) ─── */
  const registerSocket = useCallback((socket, userRole) => {
    if (socketRef.current === socket) return;
    socketRef.current = socket;

    /* Admin-only events */
    if (userRole === 'admin') {
      socket.on('new_order', (data) => {
        addNotification('new_order', 'New Order Received',
          `Order #${data.orderId || ''} placed by ${data.customerName || 'a customer'} • Rs. ${data.total || ''}`,
          data
        );
      });

      socket.on('new_contact', (data) => {
        addNotification('new_contact', 'New Inquiry Received',
          `${data.name || 'Someone'} sent a message: "${data.subject || ''}"`,
          data
        );
      });

      socket.on('low_stock', (data) => {
        addNotification('low_stock', '⚠️ Low Stock Alert',
          `"${data.productName}" has only ${data.stock} unit${data.stock === 1 ? '' : 's'} left`,
          data
        );
      });
    }

    /* User-facing events */
    socket.on('order_status_updated', (data) => {
      addNotification('order_status_updated', 'Order Status Updated',
        `Your order #${data.orderId || ''} is now "${data.status || ''}"`,
        data
      );
    });

    socket.on('payment_approved', (data) => {
      addNotification('payment_approved', 'Payment Approved! 🎉',
        `Your bank slip for order #${data.orderId || ''} has been approved`,
        data
      );
    });

    socket.on('payment_rejected', (data) => {
      addNotification('payment_rejected', 'Payment Rejected',
        `Your bank slip for order #${data.orderId || ''} was rejected. ${data.reason || ''}`,
        data
      );
    });
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    isPanelOpen,
    setIsPanelOpen,
    addNotification,
    markRead,
    markAllRead,
    clearAll,
    registerSocket,
    TYPE_META,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
