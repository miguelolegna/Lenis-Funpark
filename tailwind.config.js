/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0A3B40',
        'brand-light': '#FFFFFF',
        'brand-gray': '#F3F4F6',
        'brand-yellow': '#FBBF24',
        'brand-red': '#EF4444',
        'brand-orange': '#F97316',
      },
      transitionTimingFunction: {
        'bounce-short': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      keyframes: {
        mount: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'mount-section': 'mount 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
