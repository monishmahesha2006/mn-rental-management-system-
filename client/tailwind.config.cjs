/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0A0E1A",
          900: "#151922",
          800: "#1E2330",
          700: "#1A2332"
        },
        gold: {
          500: "#D4AF37",
          400: "#E8C4A0",
          600: "#C19B2E",
          700: "#8B6F47"
        },
        pearl: {
          50: "#F5F1EB",
          100: "#E8DDD0"
        },
        emerald: {
          800: "#2D5F4F"
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif']
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #0A0E1A 0%, #151922 50%, #1A2332 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #C19B2E 100%)',
        'gold-shimmer': 'linear-gradient(135deg, #E8C4A0 0%, #D4AF37 100%)'
      }
    }
  },
  plugins: []
};
