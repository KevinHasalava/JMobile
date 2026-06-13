import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ChatWidget from './components/common/ChatWidget';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminChat from './pages/admin/AdminChat';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminPayments from './pages/admin/AdminPayments';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0B0C10]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
          <div className="absolute inset-0 rounded-full border-4 border-[#FF8C00] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Inner wrapper: lives inside AuthProvider so it can call useAuth()
// This lets CartProvider receive the correct userId on every render.
const AppWithCart = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id || null;

  return (
    <CartProvider userId={userId}>
      <SocketProvider>
        <NotificationProvider>
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1C1C1E',
                  color: '#E5E5E7',
                  border: '1px solid #2C2C2E',
                },
                success: { iconTheme: { primary: '#FF8C00', secondary: '#1C1C1E' } },
                error:   { iconTheme: { primary: '#EF4444', secondary: '#1C1C1E' } },
              }}
            />
            <div className="flex flex-col min-h-screen">
              <Routes>
                {/* Admin Routes - Without Header/Footer */}
                <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/products"  element={<ProtectedRoute adminOnly={true}><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/users"     element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/orders"    element={<ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/chat"      element={<ProtectedRoute adminOnly={true}><AdminChat /></ProtectedRoute>} />
                <Route path="/admin/inquiries" element={<ProtectedRoute adminOnly={true}><AdminInquiries /></ProtectedRoute>} />
                <Route path="/admin/payments"  element={<ProtectedRoute adminOnly={true}><AdminPayments /></ProtectedRoute>} />

                {/* Public Routes - With Header/Footer */}
                <Route path="/*" element={
                  <>
                    <Header />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/"         element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/cart"     element={<Cart />} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/login"    element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
                        <Route path="/about"   element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                      </Routes>
                    </main>
                    <Footer />
                    <ChatWidget />
                  </>
                } />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </SocketProvider>
    </CartProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppWithCart />
    </AuthProvider>
  );
}

export default App;

