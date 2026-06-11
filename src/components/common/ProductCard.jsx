import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { convertAndFormatPrice, getImageUrl } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

/* ── Star Rating ─────────────────────────────────────── */
const StarRating = React.memo(({ rating, reviews }) => (
  <div className="flex items-center gap-1.5 mb-3">
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating || 0) ? 'text-[#FF8C00]' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
    <span className="text-xs text-gray-500">({reviews || 0})</span>
  </div>
));
StarRating.displayName = 'StarRating';

/* ── Stock Badge ─────────────────────────────────────── */
const StockBadge = React.memo(({ stock }) => {
  if (stock === 0) return (
    <span className="badge-out-stock text-[11px] font-bold px-2.5 py-1 rounded-full">Out of Stock</span>
  );
  if (stock <= 5) return (
    <span className="badge-low-stock text-[11px] font-bold px-2.5 py-1 rounded-full">Only {stock} left!</span>
  );
  return (
    <span className="badge-in-stock text-[11px] font-bold px-2.5 py-1 rounded-full">In Stock</span>
  );
});
StockBadge.displayName = 'StockBadge';

/* ═════════════════════════════════════════════════════
   PRODUCT CARD
═════════════════════════════════════════════════════ */
const ProductCard = ({ product }) => {
  const navigate   = useNavigate();
  const { addToCart } = useCart?.() || {};
  const [imgErr, setImgErr] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleViewDetails = useCallback(() => {
    navigate(`/product/${product._id}`);
  }, [product._id, navigate]);

  const imageUrl  = useMemo(() => getImageUrl(product.images?.[0] || product.image), [product.images, product.image]);
  const isLowStock = useMemo(() => product.stock > 0 && product.stock <= 5, [product.stock]);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setAdding(true);
    try {
      if (addToCart) addToCart({ ...product, quantity: 1 });
      toast.success(`${product.name?.split(' ').slice(0,3).join(' ')} added to cart!`, {
        style: { background: '#111214', border: '1px solid rgba(255,140,0,0.3)', color: '#F0F0F0' },
        iconTheme: { primary: '#FF8C00', secondary: '#111214' },
      });
    } finally {
      setTimeout(() => setAdding(false), 600);
    }
  }, [product, isOutOfStock, addToCart]);

  return (
    <div className="product-card-premium group">
      {/* ── Image Section ───────────────────────────── */}
      <div
        className="relative overflow-hidden cursor-pointer bg-[#0d0e11]"
        style={{ height: '220px' }}
        onClick={handleViewDetails}
      >
        {!imgErr ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            style={{ transform: 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-[#111214]">📱</div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-transparent to-transparent opacity-70" />

        {/* Quick add overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex items-center gap-2 bg-[#FF8C00] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(255,140,0,0.5)] transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 hover:bg-[#FF7A00]"
            >
              {adding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
              {adding ? 'Adding...' : 'Quick Add'}
            </button>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold text-base">Out of Stock</span>
          </div>
        )}

        {/* Discount badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-[#FF8C00] to-[#FF6600] text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-lg z-10">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* ── Info Section ────────────────────────────── */}
      <div className="p-4 relative z-10">
        {/* Brand */}
        <p className="text-[11px] font-bold text-[#FF8C00] uppercase tracking-widest mb-1">{product.brand}</p>

        {/* Name */}
        <h3
          onClick={handleViewDetails}
          className="text-sm font-bold text-white mb-2 line-clamp-2 cursor-pointer hover:text-[#FF8C00] transition-colors leading-snug"
        >
          {product.name}
        </h3>

        {/* Rating */}
        <StarRating rating={product.rating} reviews={product.numReviews} />

        {/* Price + Stock Row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-black text-[#FF8C00]">{convertAndFormatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-600 line-through ml-1.5">{convertAndFormatPrice(product.originalPrice)}</span>
            )}
          </div>
          <StockBadge stock={product.stock} />
        </div>

        {/* CTA Button */}
        <button
          onClick={handleViewDetails}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border border-[#FF8C00]/30 text-[#FF8C00] hover:bg-[#FF8C00] hover:text-white hover:border-[#FF8C00] hover:shadow-[0_4px_16px_rgba(255,140,0,0.35)]"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default React.memo(ProductCard, (p, n) =>
  p.product._id === n.product._id &&
  p.product.price === n.product.price &&
  p.product.stock === n.product.stock
);
