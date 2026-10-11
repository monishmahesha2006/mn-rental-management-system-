/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Light theme color palette ensuring crystal clear contrast */
        navy: {
          50:  "#FAF8F5",
          100: "#F5EFE6",
          200: "#EAE0D0",
          700: "#4B4A6A",
          800: "#F9F6F0",
          900: "#F3ECE1",
          950: "#1E1B4B"
        },
        gold: {
          50:  "#FEFDF9",
          100: "#FDF8ED",
          200: "#F8ECCF",
          300: "#D97706",
          400: "#B45309",
          500: "#92400E",
          600: "#78350F",
          700: "#475569",
          800: "#334155"
        },
        pearl: {
          50:  "#1E1B4B",
          100: "#2C2C44",
          200: "#3730A3"
        },
        slate: {
          200: "#1E1B4B",
          300: "#334155",
          400: "#64748B",
          700: "#CBD5E1",
          800: "#E2E8F0",
          900: "#F8F6F0",
          950: "#1E1B4B"
        },
        mint: {
          300: "#047857",
          400: "#059669"
        },
        emerald: {
          400: "#059669",
          800: "#047857",
          900: "#064E3B"
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace']
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #FDFAF5 0%, #F7F2EA 100%)',
        'gold-gradient':   'linear-gradient(135deg, #C9962A 0%, #B8860B 100%)',
        'gold-shimmer':    'linear-gradient(135deg, #E4B84A 0%, #C9962A 100%)'
      }
    }
  },
  plugins: []
};
