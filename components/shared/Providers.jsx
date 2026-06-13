"use client";
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { CartProviderWrapper } from '@/context/CartContextWrapper';
import { SocketProvider } from '@/context/SocketContext';
import { NotificationProvider } from '@/context/NotificationContext';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import ChatWidget from '@/components/client/ChatWidget';
import { usePathname } from 'next/navigation';

export default function Providers({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "968919350255-ch6qibth61d0rnel6cu6vcutu9o046o0.apps.googleusercontent.com"}>
      <AuthProvider>
        <CartProviderWrapper>
          <SocketProvider>
            <NotificationProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: { background: '#1C1C1E', color: '#E5E5E7', border: '1px solid #2C2C2E' },
                  success: { iconTheme: { primary: '#FF8C00', secondary: '#1C1C1E' } },
                  error: { iconTheme: { primary: '#EF4444', secondary: '#1C1C1E' } },
                }}
              />
              <div className="flex flex-col min-h-screen">
                {!isAdminRoute && <Header />}
                <main className="flex-grow">
                  {children}
                </main>
                {!isAdminRoute && <Footer />}
                {!isAdminRoute && <ChatWidget />}
              </div>
            </NotificationProvider>
          </SocketProvider>
        </CartProviderWrapper>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
