/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Orange Colors
        primary: '#FF8C00',
        'primary-dark': '#FF7A00',
        'primary-light': '#FFA500',
        
        // Dark Theme Backgrounds
        'dark-bg': '#0B0C10',
        'dark-bg-secondary': '#121212',
        'dark-bg-tertiary': '#151515',
        'dark-card': '#1C1C1E',
        'dark-border': '#2C2C2C',
        
        // Text Colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#EAEAEA',
        'text-muted': '#A0A0A0',
        
        // Legacy (keeping for compatibility)
        secondary: '#1e40af',
        accent: '#3b82f6',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 4px 12px rgba(255, 140, 0, 0.2)',
        'glow-orange-lg': '0 8px 24px rgba(255, 140, 0, 0.3)',
        'card-dark': '0 4px 6px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-out',
        'slideUp': 'slideUp 0.7s ease-out',
        'slideInLeft': 'slideInLeft 0.7s ease-out',
        'slideInRight': 'slideInRight 0.7s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 5s ease-in-out infinite',
        'floatSlow': 'floatSlow 7s ease-in-out infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
        'blob': 'blob-drift 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'marquee': 'marquee 28s linear infinite',
        'pulse-ring': 'pulse-ring 3s ease-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 140, 0, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 140, 0, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-14px) rotate(1deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'blob-drift': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1.1)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
