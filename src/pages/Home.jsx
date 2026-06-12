import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';

/* ─── Brand logos data ────────────────────────────────── */
const BRANDS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Motorola', 'Sony', 'Realme'];
const BRAND_ICONS = {
  Apple:    '🍎',
  Samsung:  '🌀',
  Google:   '🔵',
  OnePlus:  '1️⃣',
  Xiaomi:   '⚡',
  Motorola: '✦',
  Sony:     '🎯',
  Realme:   '💎',
};

/* ─── Feature strip data ─────────────────────────────── */
const FEATURES = [
  {
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    title: 'Free Shipping',
    desc: 'On orders over Rs. 37,000',
    color: 'from-blue-500/20 to-blue-600/10',
    accent: 'text-blue-400',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Secure Payment',
    desc: '100% safe & encrypted',
    color: 'from-green-500/20 to-green-600/10',
    accent: 'text-green-400',
  },
  {
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    title: 'Easy Returns',
    desc: '30-day hassle-free returns',
    color: 'from-purple-500/20 to-purple-600/10',
    accent: 'text-purple-400',
  },
  {
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    title: '24/7 Support',
    desc: 'Always here to help you',
    color: 'from-orange-500/20 to-orange-600/10',
    accent: 'text-[#FF8C00]',
  },
];

/* ─── Stats counter hook ─────────────────────────────── */
const useCounter = (target, duration = 1800) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
};

/* ─── Animated hero phone graphic ───────────────────── */
const HeroPhone = () => (
  <div className="relative flex items-center justify-center select-none">
    {/* Outer glow rings */}
    <div className="absolute w-80 h-80 rounded-full border border-[#FF8C00]/8 animate-spin-slow" />
    <div className="absolute w-64 h-64 rounded-full border border-[#FF8C00]/12" style={{ animationDelay: '2s' }} />

    {/* Orbiting dot */}
    <div className="absolute w-64 h-64 animate-spin-slow" style={{ animationDuration: '8s' }}>
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FF8C00] shadow-[0_0_12px_4px_rgba(255,140,0,0.6)]" />
    </div>

    {/* Phone frame */}
    <div className="relative animate-float z-10">
      {/* Ambient glow behind phone */}
      <div className="absolute inset-0 bg-[#FF8C00]/20 rounded-[40px] blur-2xl scale-110" />

      <div className="relative w-44 bg-gradient-to-b from-[#1C1C1E] to-[#0B0C10] rounded-[36px] shadow-2xl border border-white/10 overflow-hidden"
           style={{ height: '340px' }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-[10px] text-gray-400 font-medium">9:41</span>
          <div className="w-14 h-4 bg-black rounded-full" />
          <div className="flex gap-1 items-center">
            <div className="w-3 h-2 border border-gray-400 rounded-sm">
              <div className="w-2 h-full bg-green-400 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div className="px-3 space-y-2">
          <div className="w-full h-24 rounded-2xl bg-gradient-to-br from-[#FF8C00]/30 to-[#FF7A00]/10 flex items-center justify-center border border-[#FF8C00]/20">
            <span className="text-4xl">📱</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 bg-gray-700 rounded-full w-3/4" />
            <div className="h-2 bg-gray-800 rounded-full w-1/2" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-[#FF8C00] rounded-xl flex items-center justify-center">
              <div className="h-1.5 bg-white/80 rounded-full w-10" />
            </div>
            <div className="w-8 h-8 bg-gray-800 rounded-xl border border-gray-700" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-xl border border-gray-800">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex-shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="h-1.5 bg-gray-600 rounded-full w-3/4" />
                <div className="h-1 bg-gray-700 rounded-full w-1/2" />
              </div>
              <div className="h-2 bg-[#FF8C00]/60 rounded-full w-8" />
            </div>
          ))}
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-600 rounded-full" />
      </div>
    </div>

    {/* Floating badges */}
    <div className="absolute -left-4 top-16 glass-card-orange px-3 py-2 rounded-xl animate-floatSlow shadow-lg"
         style={{ animationDelay: '1s' }}>
      <p className="text-[#FF8C00] text-xs font-bold">⭐ 4.9 Rating</p>
      <p className="text-gray-400 text-[10px]">10k+ Reviews</p>
    </div>

    <div className="absolute -right-6 bottom-24 glass-card-orange px-3 py-2 rounded-xl animate-floatSlow shadow-lg"
         style={{ animationDelay: '2.5s' }}>
      <p className="text-[#FF8C00] text-xs font-bold">🚀 Fast Delivery</p>
      <p className="text-gray-400 text-[10px]">Same day shipping</p>
    </div>

    <div className="absolute -right-2 top-8 glass-card px-2.5 py-1.5 rounded-lg animate-floatSlow shadow-lg"
         style={{ animationDelay: '0.5s' }}>
      <p className="text-green-400 text-xs font-bold">✓ Verified</p>
    </div>
  </div>
);

/* ─── Stats counter component ────────────────────────── */
const StatCounter = ({ value, label, suffix = '' }) => {
  const [count, ref] = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-black gradient-text">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────── */
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products?limit=8');
        if (response.data.success) {
          const sorted = [...response.data.data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setFeaturedProducts(sorted.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] overflow-x-hidden">

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center py-20 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-[10%] w-96 h-96 bg-[#FF8C00] opacity-[0.06] rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-10 right-[5%] w-[500px] h-[500px] bg-[#FF8C00] opacity-[0.04] rounded-full blur-[140px] animate-blob" style={{ animationDelay: '4s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a0a00] opacity-40 rounded-full blur-3xl" />
        </div>

        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle, #FF8C00 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left copy */}
            <div className="animate-slideInLeft">
              <div className="inline-flex items-center gap-2 bg-[#FF8C00]/10 border border-[#FF8C00]/25 text-[#FF8C00] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-[#FF8C00] rounded-full animate-pulse" />
                ✨ New Arrivals Just Dropped
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
                <span className="text-white">Discover</span>
                <br />
                <span className="gradient-text">Premium</span>
                <br />
                <span className="text-white">Mobiles</span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-md">
                Shop the latest flagship smartphones with cutting-edge technology, 
                unbeatable prices, and next-day delivery right to your door.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  to="/products"
                  className="btn-orange-glow flex items-center gap-2 text-base"
                >
                  Shop Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/products"
                  className="flex items-center gap-2 border-2 border-gray-700 text-gray-300 px-8 py-3 rounded-xl font-semibold hover:border-[#FF8C00] hover:text-[#FF8C00] transition-all duration-300"
                >
                  Explore All
                </Link>
              </div>

              {/* Quick trust signals */}
              <div className="flex flex-wrap items-center gap-6">
                {['Free Shipping', 'Genuine Products', 'Easy Returns'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg className="w-4 h-4 text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Phone graphic */}
            <div className="flex justify-center lg:justify-end animate-slideInRight">
              <HeroPhone />
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 5000, suffix: '+', label: 'Products Sold' },
              { value: 200,  suffix: '+', label: 'Phone Models' },
              { value: 15,   suffix: 'k+', label: 'Happy Customers' },
              { value: 99,   suffix: '%', label: 'Satisfaction Rate' },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl py-5 px-4 text-center hover:border-[#FF8C00]/30 transition-colors">
                <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURE STRIP
      ══════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-[#0e0f12] border-y border-gray-800/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feat, i) => (
              <div
                key={feat.title}
                className={`glass-card rounded-2xl p-6 flex items-start gap-4 hover:border-[#FF8C00]/30 transition-all duration-300 group cursor-default`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`bg-gradient-to-br ${feat.color} p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <svg className={`w-6 h-6 ${feat.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feat.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{feat.title}</h3>
                  <p className="text-gray-400 text-sm leading-snug">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-[#0B0C10]">
        <div className="container mx-auto max-w-7xl">
          {/* Section heading */}
          <div className="text-center mb-14">
            <span className="inline-block text-[#FF8C00] font-semibold uppercase tracking-widest text-xs mb-3">
              Our Collection
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Featured <span className="gradient-text">Products</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              Handpicked smartphones with the best specs, reviews, and prices
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-800 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-[#FF8C00] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products available at the moment.</p>
            </div>
          )}

          <div className="text-center">
            <Link to="/products" className="btn-orange-glow inline-flex items-center gap-2 text-base">
              View All Products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PROMO BANNER
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-[#0e0f12] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF8C00] opacity-[0.05] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FF8C00] opacity-[0.05] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="glass-card rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center gap-10 hover:border-[#FF8C00]/20 transition-colors">
            {/* Text side */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/25 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
                🔥 Limited Time Offer
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
                Big Sale <span className="gradient-text">Is On!</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-md">
                Get up to 20% off on selected flagship smartphones. Don't let these deals slip away!
              </p>
              <Link to="/products" className="btn-orange-glow inline-flex items-center gap-2 text-base">
                Grab the Deal
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Badge side */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="relative">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full bg-[#FF8C00]/20 blur-xl scale-110 animate-pulse" />
                <div className="relative w-52 h-52 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FF6600] flex flex-col items-center justify-center shadow-[0_0_60px_rgba(255,140,0,0.4)]">
                  <p className="text-white text-7xl font-black leading-none">20</p>
                  <p className="text-white text-2xl font-black tracking-widest">%</p>
                  <p className="text-white/80 text-sm font-semibold tracking-wider mt-1">OFF</p>
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-float">
                  <span className="text-lg">⚡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BRANDS MARQUEE
      ══════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-[#0B0C10] border-t border-gray-800/50">
        <div className="container mx-auto max-w-7xl mb-10 text-center">
          <span className="inline-block text-[#FF8C00] font-semibold uppercase tracking-widest text-xs mb-3">
            Partners
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Top <span className="gradient-text">Brands</span>
          </h2>
        </div>

        {/* Marquee track — duplicated for seamless loop */}
        <div className="overflow-hidden py-4 relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0B0C10] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0B0C10] to-transparent z-10" />

          <div className="marquee-track">
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <div
                key={`${brand}-${i}`}
                className="flex-shrink-0 mx-4 glass-card rounded-2xl px-8 py-5 flex items-center gap-3 hover:border-[#FF8C00]/40 transition-all duration-300 group cursor-pointer"
                style={{ minWidth: '160px' }}
              >
                <span className="text-2xl">{BRAND_ICONS[brand]}</span>
                <span className="text-lg font-bold text-gray-300 group-hover:text-[#FF8C00] transition-colors duration-300 whitespace-nowrap">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          NEWSLETTER / CTA SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-[#0e0f12] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,140,0,0.05) 0%, transparent 70%)',
          }}
        />

        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <span className="inline-block text-3xl mb-4">📬</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Stay <span className="gradient-text">Updated</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Get exclusive deals, new arrivals, and tech news delivered to your inbox. No spam, ever.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-[#1C1C1E] border border-gray-700 focus:border-[#FF8C00] rounded-xl px-5 py-3.5 text-white outline-none transition-colors placeholder-gray-500"
            />
            <button
              type="submit"
              className="btn-orange-glow whitespace-nowrap px-7 py-3.5"
            >
              Subscribe
            </button>
          </form>

          <p className="text-gray-600 text-sm mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </section>

    </div>
  );
};

export default Home;
