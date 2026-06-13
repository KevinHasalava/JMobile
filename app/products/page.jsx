"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ProductCard from '@/components/client/ProductCard';
import ProductSkeleton from '@/components/client/ProductSkeleton';
import { convertAndFormatPrice } from '@/utils/currency';
import { productsAPI } from '@/services/api';

const Products = () => {
  // State management
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All Products', slug: 'all' }]);
  const [brands, setBrands] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and sort state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [sortBy, setSortBy] = useState('-createdAt');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Fetch products from API - only on component mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products with pagination
      const response = await productsAPI.getAll({
        limit: 100, // Get more products at once
        page: 1
      });

      console.log('✅ Products API Response:', response.data);

      if (response.data.success) {
        setAllProducts(response.data.data);

        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.data.map(p => p.category))];
        const categoryList = [
          { id: 'all', name: 'All Products', slug: 'all' },
          ...uniqueCategories.map(cat => ({
            id: cat.toLowerCase(),
            name: cat,
            slug: cat.toLowerCase()
          }))
        ];
        setCategories(categoryList);

        // Extract unique brands
        const uniqueBrands = [...new Set(response.data.data.map(p => p.brand))];
        setBrands(['All', ...uniqueBrands]);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (err) {
      console.error('❌ Error fetching products:', {
        message: err.message,
        response: err.response?.status,
        data: err.response?.data,
      });

      if (err.response?.status === 404) {
        setError(`Products endpoint not found. Please check if the backend is running.`);
      } else if (err.code === 'ERR_NETWORK') {
        setError(`Cannot connect to backend server. Please check your connection.`);
      } else {
        setError(`Failed to load products: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products from API - only on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Memoized filter function - only recalculates when dependencies change
  const filteredProducts = useMemo(() => {
    console.log('🔍 Recalculating filtered products...');
    return allProducts.filter((product) => {
      const categoryMatch = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory;
      const brandMatch = selectedBrand === 'All' || product.brand === selectedBrand;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

      return categoryMatch && brandMatch && priceMatch;
    });
  }, [allProducts, selectedCategory, selectedBrand, priceRange]);

  // Memoized sorting function
  const sortedProducts = useMemo(() => {
    console.log('📊 Sorting products by:', sortBy);
    const sorted = [...filteredProducts];
    
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case '-createdAt':
        default:
          return 0; // API already sorts by creation date
      }
    });
    
    return sorted;
  }, [filteredProducts, sortBy]);

  // Memoized pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedProducts.length / itemsPerPage);
  }, [sortedProducts.length, itemsPerPage]);

  // Memoized event handlers
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page
  }, []);

  const handleBrandChange = useCallback((brand) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  }, []);

  const handlePriceChange = useCallback((value) => {
    setPriceRange([0, parseInt(value)]);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedBrand('All');
    setPriceRange([0, 1500]);
    setSortBy('-createdAt');
    setCurrentPage(1);
  }, []);

  const handlePricePreset = useCallback((min, max) => {
    setPriceRange([min, max]);
    setCurrentPage(1);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg py-8 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-2">
              All Products
            </h1>
            <p className="text-text-muted text-lg">
              Loading products...
            </p>
          </div>
          <ProductSkeleton count={12} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg py-8 px-4">
        <div className="container mx-auto">
          <div className="bg-dark-card border border-red-500/30 rounded-2xl p-12 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Error Loading Products</h3>
            <p className="text-text-muted mb-6">{error}</p>
            <button
              onClick={fetchProducts}
              className="btn-orange-glow"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-2">
            All Products
          </h1>
          <p className="text-text-muted text-lg">
            Showing <span className="text-primary font-semibold">{paginatedProducts.length}</span> of{' '}
            <span className="text-primary font-semibold">{sortedProducts.length}</span> products
            {filteredProducts.length < allProducts.length && (
              <span> (filtered from {allProducts.length} total)</span>
            )}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 space-y-6 bg-[#111] p-5 rounded-3xl border border-gray-800 h-fit lg:sticky lg:top-24 z-10 shadow-2xl">
            {/* Categories */}
            <div className="bg-dark-card p-6 rounded-2xl border border-dark-border">
              <h3 className="font-semibold text-lg mb-4 text-text-primary flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Categories
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all font-medium ${selectedCategory === category.slug
                        ? 'bg-gradient-orange text-white shadow-glow-orange'
                        : 'hover:bg-dark-bg text-text-secondary hover:text-primary'
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="bg-dark-card p-6 rounded-2xl border border-dark-border">
              <h3 className="font-semibold text-lg mb-4 text-text-primary flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Brands
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-dark-bg transition-colors">
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === brand}
                      onChange={() => handleBrandChange(brand)}
                      className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 bg-dark-bg border-dark-border"
                    />
                    <span className="text-text-secondary group-hover:text-primary transition-colors text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-dark-card p-6 rounded-2xl border border-dark-border">
              <h3 className="font-semibold text-lg mb-4 text-text-primary flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Price Range
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-text-secondary font-semibold">
                  <span className="text-primary">{convertAndFormatPrice(priceRange[0])}</span>
                  <span className="text-primary">{convertAndFormatPrice(priceRange[1])}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="space-y-2">
                  <button
                    onClick={() => handlePricePreset(0, 500)}
                    className="w-full text-left px-4 py-2 rounded-xl hover:bg-dark-bg text-text-secondary hover:text-primary text-sm transition-colors"
                  >
                    Under Rs. 185,000
                  </button>
                  <button
                    onClick={() => handlePricePreset(500, 1000)}
                    className="w-full text-left px-4 py-2 rounded-xl hover:bg-dark-bg text-text-secondary hover:text-primary text-sm transition-colors"
                  >
                    Rs. 185,000 - Rs. 370,000
                  </button>
                  <button
                    onClick={() => handlePricePreset(1000, 1500)}
                    className="w-full text-left px-4 py-2 rounded-xl hover:bg-dark-bg text-text-secondary hover:text-primary text-sm transition-colors"
                  >
                    Over Rs. 370,000
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={handleResetFilters}
              className="w-full bg-dark-border text-text-secondary px-4 py-3 rounded-xl hover:bg-primary hover:text-white transition-all font-medium"
            >
              Reset Filters
            </button>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Sort Options */}
            <div className="bg-dark-card p-4 rounded-2xl border border-dark-border mb-6 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-text-muted mb-2 sm:mb-0 font-medium">
                <span className="text-primary">{sortedProducts.length}</span> Products Found
              </p>
              <div className="flex items-center space-x-3">
                <label className="text-text-secondary font-medium">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-dark-bg border border-dark-border text-text-secondary rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="-createdAt">Latest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-dark-border text-text-secondary disabled:opacity-50 hover:bg-dark-bg transition-colors"
                    >
                      ← Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${currentPage === page
                            ? 'bg-gradient-orange text-white shadow-glow-orange'
                            : 'border border-dark-border text-text-secondary hover:bg-dark-bg'
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-dark-border text-text-secondary disabled:opacity-50 hover:bg-dark-bg transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-dark-card p-12 rounded-2xl border border-dark-border text-center">
                <svg
                  className="w-24 h-24 mx-auto text-text-muted mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  No products found
                </h3>
                <p className="text-text-muted mb-6">
                  Try adjusting your filters to see more results
                </p>
                <button
                  onClick={handleResetFilters}
                  className="btn-orange-glow"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
