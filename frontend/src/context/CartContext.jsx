import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

/* ── per-user localStorage key ───────────────────────── */
const cartKey  = (userId) => userId ? `cart_${userId}` : null;

const loadCart = (userId) => {
  const key = cartKey(userId);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveCart = (userId, items) => {
  const key = cartKey(userId);
  if (!key) return;                          // never persist a guest cart to a keyed slot
  try { localStorage.setItem(key, JSON.stringify(items)); }
  catch { /* quota */ }
};

/* ═════════════════════════════════════════════════════
   PROVIDER  — accepts userId prop from App.js
═════════════════════════════════════════════════════ */
export const CartProvider = ({ children, userId }) => {
  // Initialise from the correct per-user key immediately
  const [cart, setCart] = useState(() => loadCart(userId));

  /* ── When userId changes (login / logout / switch account):
        load the new user's cart and discard the previous one   */
  useEffect(() => {
    setCart(loadCart(userId));
  }, [userId]);

  /* ── Persist to localStorage whenever cart or userId changes  */
  useEffect(() => {
    saveCart(userId, cart);
  }, [cart, userId]);

  /* ── Cart actions ─────────────────────────────────── */
  const addToCart = useCallback((product, quantity = 1) => {
    // ── Auth guard: only registered users may add to cart ────────────────
    // userId is the logged-in user's ID passed from App via CartProvider.
    // If it is falsy (guest / logged-out), block the action and prompt login.
    if (!userId) {
      // Dynamically import toast so CartContext stays free of extra deps at module level
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error(
          (t) => {
            const dismiss = () => toast.dismiss(t.id);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#fff' }}>
                  🔒 Sign in required
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>
                  Please log in to add items to your cart.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <a
                    href="/login"
                    onClick={dismiss}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg,#FF8C00,#FF6600)',
                      color: '#fff',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    onClick={dismiss}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: 'transparent',
                      color: '#FF8C00',
                      border: '1px solid rgba(255,140,0,0.5)',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                  >
                    Register
                  </a>
                </div>
              </div>
            );
          },
          {
            duration: 5000,
            style: {
              background: '#1C1C1E',
              border: '1px solid rgba(255,140,0,0.25)',
              padding: '14px 16px',
              maxWidth: '320px',
            },
            // suppress the default red ✕ icon
            icon: null,
          }
        );
      });
      return; // ← stop here; do NOT add to cart
    }

    // ── Logged-in user: normal cart add ──────────────────────────────────
    setCart(prev => {
      const id = product._id || product.id;
      const exists = prev.find(i => (i._id || i.id) === id);
      if (exists) {
        return prev.map(i =>
          (i._id || i.id) === id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }, [userId]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => (i._id || i.id) !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev =>
      prev.map(i => (i._id || i.id) === productId ? { ...i, quantity } : i)
    );
  }, [removeFromCart]);

  /* clearCart wipes both state AND localStorage for this user */
  const clearCart = useCallback(() => {
    setCart([]);
    const key = cartKey(userId);
    if (key) localStorage.removeItem(key);
  }, [userId]);

  const getCartTotal = useCallback(() =>
    cart.reduce((t, i) => t + i.price * i.quantity, 0), [cart]);

  const getCartCount = useCallback(() =>
    cart.reduce((c, i) => c + i.quantity, 0), [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
