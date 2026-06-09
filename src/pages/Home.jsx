import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products?limit=8');
      
      if (response.data.success) {
        // Get first 8 products or products with highest rating
        const products = response.data.data;
        const sorted = products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setFeaturedProducts(sorted.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Hero Section */}
      <section className="gradient-dark text-white py-20 px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-dark rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0 animate-slideUp">
              <div className="mb-4">
                <span className="inline-block bg-primary bg-opacity-20 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary">
                  ✨ New Arrivals
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Latest Mobile
                <span className="block text-primary">Phones</span>
              </h1>
              <p className="text-xl mb-8 text-text-secondary leading-relaxed">
                Discover the newest smartphones with cutting-edge technology and amazing features. Experience the future today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="btn-orange-glow"
                >
                  Shop Now
                </Link>
                <Link
                  to="/products"
                  className="border-2 border-primary text-primary px-8 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all hover:shadow-glow-orange"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative animate-fadeIn">
                <div className="absolute inset-0 bg-primary opacity-20 rounded-full blur-3xl animate-glow"></div>
                <img
                  src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
                  alt="Featured Phone"
                  className="relative z-10 w-64 md:w-96 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-dark-bg-tertiary">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-6 bg-dark-card rounded-2xl border border-dark-border hover:border-primary transition-all card-hover group">
              <div className="bg-gradient-orange p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-text-primary">Free Shipping</h3>
              <p className="text-text-muted text-sm">On orders over Rs. 37,000</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-dark-card rounded-2xl border border-dark-border hover:border-primary transition-all card-hover group">
              <div className="bg-gradient-orange p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-text-primary">Secure Payment</h3>
              <p className="text-text-muted text-sm">100% secure transactions</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-dark-card rounded-2xl border border-dark-border hover:border-primary transition-all card-hover group">
              <div className="bg-gradient-orange p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-text-primary">Easy Returns</h3>
              <p className="text-text-muted text-sm">30-day return policy</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-dark-card rounded-2xl border border-dark-border hover:border-primary transition-all card-hover group">
              <div className="bg-gradient-orange p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-text-primary">24/7 Support</h3>
              <p className="text-text-muted text-sm">Dedicated customer service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-dark-bg">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-primary font-semibold mb-3 uppercase tracking-wider text-sm">
              Our Collection
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Featured Products
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              Check out our handpicked selection of the best smartphones available right now
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-3"></div>
                <p className="text-text-muted">Loading products...</p>
              </div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted text-lg">No products available at the moment.</p>
            </div>
          )}

          <div className="text-center">
            <Link
              to="/products"
              className="inline-block btn-orange-glow"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-16 px-4 bg-dark-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between bg-dark-card rounded-3xl p-8 md:p-12 border border-dark-border">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <span className="inline-block bg-primary bg-opacity-20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-primary">
                🔥 Limited Time
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
                Special Offer!
              </h2>
              <p className="text-xl mb-6 text-text-secondary">
                Get up to 20% off on selected smartphones. Don't miss out on these amazing deals!
              </p>
              <Link
                to="/products"
                className="inline-block btn-orange-glow"
              >
                Shop Deals
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-gradient-orange p-12 rounded-3xl shadow-glow-orange-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-10"></div>
                <div className="text-center relative z-10">
                  <p className="text-7xl font-bold mb-2">20%</p>
                  <p className="text-3xl font-semibold tracking-wider">OFF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 px-4 bg-dark-bg-tertiary">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-primary font-semibold mb-3 uppercase tracking-wider text-sm">
              Partners
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Top Brands
            </h2>
            <p className="text-text-muted text-lg">
              We carry the best mobile phone brands in the market
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Motorola'].map((brand) => (
              <div
                key={brand}
                className="bg-dark-card p-6 rounded-2xl border border-dark-border hover:border-primary transition-all cursor-pointer flex items-center justify-center group card-hover"
              >
                <p className="text-lg font-semibold text-text-secondary group-hover:text-primary transition-colors">{brand}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
