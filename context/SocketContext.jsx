"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import api from '@/services/api';

const SocketContext = createContext();

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token } = useAuth();
  
  const pollingInterval = useRef(null);
  
  let addNotification = null;
  try {
    const notifCtx = useNotifications();
    addNotification = notifCtx.addNotification;
  } catch { }

  useEffect(() => {
    // Polling simulation for Next.js App Router (Replaces Socket.io)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setConnected(true);
    
    if (token && user) {
      pollingInterval.current = setInterval(async () => {
        try {
          const { data } = await api.get('/chat/unread', {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Handle unread updates gracefully here if necessary
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 15000);
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [token, user]);

  const emitEvent = useCallback((eventName, data, cb) => {
    console.warn(`Emit event stubbed for polling architecture: ${eventName}`);
    if (cb) cb();
  }, []);

  const onEvent = useCallback((eventName, cb) => {
    // Stub for socket.on
  }, []);

  const offEvent = useCallback((eventName, cb) => {
    // Stub for socket.off
  }, []);

  const value = { socket: { connected: true, emit: emitEvent, on: onEvent, off: offEvent }, connected, onlineUsers, emitEvent };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
