import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { convertAndFormatPrice, getImageUrl } from '../utils/currency';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Fetch product details from API
  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      
      if (response.data.success) {
        setProduct(response.data.data);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      if (err.response?.status === 404) {
        setError('Product not found or has been removed');
      } else {
        setError('Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get all available images (support both single image and images array)
  const getProductImages = () => {
    const images = [];
    if (product.images && product.images.length > 0) {
      images.push(...product.images.map(img => getImageUrl(img)));
    } else if (product.image) {
      images.push(getImageUrl(product.image));
    }
    return images.length > 0 ? images : ['/placeholder.png'];
  };

  const productImages = product ? getProductImages() : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state (product not found or deleted)
  if (error || !product) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center max-w-md">
          <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Product Not Found</h2>
          <p className="text-text-muted mb-6">
            {error || 'This product may have been removed or is no longer available'}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="btn-orange-glow"
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-text-muted mb-6">
          <button onClick={() => navigate('/')} className="hover:text-primary">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-primary">Products</button>
          <span>/</span>
          <span className="text-text-primary font-medium">{product.name}</span>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image/Video Gallery */}
            <div>
              {/* Main Display Area */}
              <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {showVideo && product.video ? (
                  <video
                    src={product.video}
                    controls
                    className="w-full h-96 object-contain"
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-96 object-contain"
                  />
                )}
              </div>

              {/* Thumbnails - Images and Video */}
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={`img-${index}`}
                    onClick={() => {
                      setSelectedImage(index);
                      setShowVideo(false);
                    }}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImage === index && !showVideo ? 'border-primary' : 'border-gray-200'
                    } hover:border-primary transition-colors`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-contain"
                    />
                  </button>
                ))}
                
                {/* Video Thumbnail */}
                {product.video && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`border-2 rounded-lg overflow-hidden relative ${
                      showVideo ? 'border-primary' : 'border-gray-200'
                    } hover:border-primary transition-colors bg-gray-200`}
                  >
                    <div className="w-full h-20 flex items-center justify-center">
                      <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-75 text-white text-xs text-center py-0.5 rounded">
                      Video
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Brand */}
              <p className="text-sm text-text-muted mb-2 uppercase tracking-wide font-semibold">{product.brand}</p>
              
              {/* Name */}
              <h1 className="text-3xl font-bold text-text-primary mb-2">{product.name}</h1>

              {/* Model */}
              {product.model && (
                <p className="text-sm text-text-secondary mb-4">Model: {product.model}</p>
              )}

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-5 h-5 ${
                        index < Math.floor(product.rating) ? 'fill-current' : 'fill-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-primary">{convertAndFormatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {convertAndFormatPrice(product.originalPrice)}
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Save {product.discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">In Stock</span>
                    {product.stock < 10 && (
                      <span className="ml-2 text-orange-500">
                        (Only {product.stock} left)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Quantity:</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-6 py-2 font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-gray-600 text-sm">
                      ({product.stock} available)
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {product.stock > 0 && (
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-secondary transition-colors font-semibold flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {addedToCart ? 'Added!' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Buy Now
                  </button>
                </div>
              )}

              {/* Additional Info */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                  <span>Free shipping on orders over Rs. 37,000</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>1 year manufacturer warranty</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && Object.values(product.specifications).some(val => 
            Array.isArray(val) ? val.length > 0 : val
          ) && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications)
                  .filter(([key, value]) => {
                    // Only show non-empty values
                    if (Array.isArray(value)) {
                      return value.length > 0;
                    }
                    return value && value.toString().trim() !== '';
                  })
                  .map(([key, value]) => (
                    <div key={key} className="flex border-b border-dark-border py-3">
                      <span className="font-semibold text-text-secondary w-1/3 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-text-primary w-2/3">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
