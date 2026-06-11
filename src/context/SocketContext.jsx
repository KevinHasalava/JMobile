import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const SocketContext = createContext();

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const [socket,      setSocket]      = useState(null);
  const [connected,   setConnected]   = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token } = useAuth();

  // NotificationContext may not be ready on first render — safe access
  let registerSocket = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const notifCtx = useNotifications();
    registerSocket = notifCtx.registerSocket;
  } catch { /* NotificationProvider not yet mounted */ }

  useEffect(() => {
    // Connect even without token for public events (guest browsing)
    // Dynamic Vercel Origin for Production, Localhost fallback for Dev
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');

    const newSocket = io(backendUrl, {
      auth:              token ? { token } : {},
      reconnection:      true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('onlineUsers', (users) => setOnlineUsers(users));

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
    });

    setSocket(newSocket);

    // Register with NotificationContext after socket is created
    if (registerSocket && user) {
      registerSocket(newSocket, user.role);
    }

    return () => {
      newSocket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  // Re-register socket with NotificationContext when registerSocket becomes available
  useEffect(() => {
    if (socket && registerSocket && user) {
      registerSocket(socket, user.role);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerSocket, socket, user?.role]);

  /* ── helper: emit with optional callback ────────── */
  const emitEvent = useCallback((eventName, data, cb) => {
    if (socket?.connected) {
      socket.emit(eventName, data, cb);
    } else {
      console.warn(`Socket not connected, cannot emit: ${eventName}`);
    }
  }, [socket]);

  const value = { socket, connected, onlineUsers, emitEvent };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
