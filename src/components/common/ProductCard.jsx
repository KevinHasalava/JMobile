import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { convertAndFormatPrice, getImageUrl } from '../../utils/currency';

// Memoized star rating component to prevent re-renders
const StarRating = React.memo(({ rating, reviews }) => {
  return (
    <div className="flex items-center mb-3">
      <div className="flex text-primary">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-4 h-4 ${index < Math.floor(rating) ? 'fill-current' : 'fill-gray-600'}`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-text-muted ml-2">({reviews || 0})</span>
    </div>
  );
});

StarRating.displayName = 'StarRating';

// Memoized stock status component
const StockStatus = React.memo(({ stock }) => {
  return (
    <div className="mb-4">
      {stock > 0 ? (
        <span className="text-green-400 text-sm font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          In Stock
        </span>
      ) : (
        <span className="text-red-400 text-sm font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Out of Stock
        </span>
      )}
    </div>
  );
});

StockStatus.displayName = 'StockStatus';

// Main ProductCard component with React.memo to prevent unnecessary re-renders
const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  // Use useCallback to memoize the handler
  const handleViewDetails = useCallback(() => {
    const productId = product._id || product.id;
    navigate(`/product/${product._id}`);
  }, [product._id, product.id, navigate]);

  // Compute derived values with useMemo to avoid recalculation
  const displayImage = useMemo(() => getImageUrl(product.images?.[0] || product.image), [product.images, product.image]);

  const isLowStock = useMemo(() => product.stock > 0 && product.stock < 10, [product.stock]);

  const imageUrl = useMemo(() => displayImage, [displayImage]);

  return (
    <div className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border hover:border-primary transition-all duration-300 card-hover animate-fadeIn group">
      {/* Product Image */}
      <div className="relative cursor-pointer overflow-hidden" onClick={handleViewDetails}>
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60"></div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-lg font-bold">Out of Stock</span>
          </div>
        )}
        {product.discount && (
          <div className="absolute top-3 right-3 bg-gradient-orange text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-glow-orange">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Brand */}
        <p className="text-sm text-primary font-medium mb-1 uppercase tracking-wide">{product.brand}</p>

        {/* Product Name */}
        <h3 
          className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 hover:text-primary cursor-pointer transition-colors" 
          onClick={handleViewDetails}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <StarRating rating={product.rating} reviews={product.numReviews} />

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">{convertAndFormatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-text-muted line-through">{convertAndFormatPrice(product.originalPrice)}</span>
            )}
          </div>
          {isLowStock && (
            <span className="text-xs text-orange-400 font-semibold bg-orange-500 bg-opacity-10 px-2 py-1 rounded-lg">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Stock Status */}
        <StockStatus stock={product.stock} />

        {/* Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 btn-orange-glow py-2.5 px-4 rounded-xl font-semibold text-sm"
          >
            View Details
          </button>
          <button
            className="p-2.5 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all hover:scale-110 hover:shadow-glow-orange"
            title="Add to Wishlist"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Use React.memo to prevent re-renders unless product prop changes
export default React.memo(ProductCard, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false otherwise
  return (
    prevProps.product._id === nextProps.product._id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.stock === nextProps.product.stock
  );
});
