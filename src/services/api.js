import axios from 'axios';

// ─── Bulletproof Base URL Resolution ──────────────────────────────────────────
//
// Priority chain (highest → lowest):
//   1. In production: always use relative '/api' — works on every Vercel domain
//      (prod, preview, branch) without needing ANY env var.
//   2. Local dev: use REACT_APP_API_URL from .env if it points to a real server.
//   3. Final safety net: derive from window.location.origin so a misconfigured
//      or missing Vercel env var can NEVER break the app.
//
const resolveBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Same-origin relative path — no CORS, works on any Vercel branch URL.
    return '/api';
  }

  // Local development — use .env value if it isn't pointing at the frontend port
  const envURL = process.env.REACT_APP_API_URL;
  if (envURL && !envURL.includes('localhost:3000') && !envURL.includes('localhost:3001')) {
    return envURL;
  }

  // Dynamic fallback: derive API base from whatever origin the app is currently on.
  // Covers staging, preview URLs, and any misconfigured env var state.
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = resolveBaseURL();

// ─── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — unified error logging ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.status,
        error.response?.data
      );
    }
    return Promise.reject(error);
  }
);

// ─── Products API ──────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll:      (params) => api.get('/products', { params }),
  getById:     (id)     => api.get(`/products/${id}`),
  getFeatured: ()       => api.get('/products/featured'),
  create:      (data)   => api.post('/products', data),
  update:      (id, data) => api.put(`/products/${id}`, data),
  delete:      (id)     => api.delete(`/products/${id}`),
};

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login:        (credentials) => api.post('/users/login', credentials),
  googleLogin:  (data)        => api.post('/users/google', data),
  register:     (userData)    => api.post('/users/register', userData),
  getProfile:   ()            => api.get('/users/profile'),
  updateProfile:(data)        => api.put('/users/profile', data),
};

// ─── User Management API (Admin) ───────────────────────────────────────────────
export const usersAPI = {
  getAll: ()   => api.get('/users'),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── Orders API ────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create:           (orderData)              => api.post('/orders', orderData),
  getById:          (id)                     => api.get(`/orders/${id}`),
  getMyOrders:      ()                       => api.get('/orders/myorders'),
  getAllOrders:      ()                       => api.get('/orders'),
  updateToPaid:     (id, paymentResult)      => api.put(`/orders/${id}/pay`, paymentResult),
  updateToDelivered:(id)                     => api.put(`/orders/${id}/deliver`),
  updateStatus:     (id, status)             => api.put(`/orders/${id}/status`, { status }),
  cancelOrder:      (id)                     => api.delete(`/orders/${id}`),
};

// ─── Customers API (Admin) ─────────────────────────────────────────────────────
export const customersAPI = {
  getAll:  ()         => api.get('/customers'),
  getById: (id)       => api.get(`/customers/${id}`),
  create:  (data)     => api.post('/customers', data),
  update:  (id, data) => api.put(`/customers/${id}`, data),
  delete:  (id)       => api.delete(`/customers/${id}`),
};

export default api;
