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
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 140, 0, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 140, 0, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
