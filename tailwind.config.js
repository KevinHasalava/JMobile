/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        'dark-bg': '#09090b',
        'dark-card': '#18181b',
        'dark-elevated': '#27272a',
        'dark-border': '#27272a',
        'text-primary': '#f4f4f5',
        'text-secondary': '#a1a1aa',
        'text-muted': '#71717a',
        'primary': '#FF8C00',
      }
    },
  },
  plugins: [],
};
