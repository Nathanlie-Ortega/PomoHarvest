/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'secondary': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'soil': {
          100: '#F5F0E6',
          200: '#E6D8C5',
          300: '#D1BC9E',
          400: '#B39F7D',
          500: '#8A7355',
        },
        // Enhanced Farm Theme Colors
        'farm': {
          'light': '#8FD5E3', // RGB(143, 213, 227) - Updated cooler color
          'dark': '#654321',  // RGB(101, 67, 33) - Dark brown for contrast
          'border': '#8B4513', // Saddle brown for borders
          'grass': '#228B22',  // Forest green for grass
          'sky-light': '#87CEEB', // Sky blue for light mode
          'sky-dark': '#191970',  // Midnight blue for dark mode
          'sun': '#FFD700',    // Gold for sun
          'moon': '#C0C0C0',   // Silver for moon
        },
        // Plant-specific theme colors
        'carrot': {
          50: '#fff3e0',
          100: '#ffe0b3',
          500: '#d4822a',
          900: '#8b5a2b',
        },
        'tomato': {
          50: '#ffebee',
          100: '#ffcdd2',
          500: '#ef5350',
          900: '#c62828',
        },
        'wheat': {
          50: '#fffde7',
          100: '#fff9c4',
          500: '#fbc02d',
          900: '#f57f17',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'display': ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'grow': 'grow 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        // Enhanced Farm animations
        'float': 'float 20s infinite linear',
        'grass-wave': 'grassWave 3s ease-in-out infinite',
        'plant-grow': 'plantGrow 2s ease-out both',
        'plant-sway': 'plantSway 3s ease-in-out infinite',
        'glow': 'glow 4s ease-in-out infinite alternate',
        'twinkle': 'twinkle 3s ease-in-out infinite alternate',
      },
      keyframes: {
        grow: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        // Enhanced Farm keyframes
        float: {
          '0%': { transform: 'translateX(-100px)' },
          '100%': { transform: 'translateX(calc(100vw + 100px))' },
        },
        grassWave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(2deg)' },
          '75%': { transform: 'rotate(-2deg)' },
        },
        plantGrow: {
          'from': {
            transform: 'scale(0) translateY(20px)',
            opacity: '0',
          },
          'to': {
            transform: 'scale(1) translateY(0)',
            opacity: '1',
          },
        },
        plantSway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px currentColor' },
          '100%': { boxShadow: '0 0 40px currentColor, 0 0 60px currentColor' },
        },
        twinkle: {
          '0%': { 
            opacity: '0.3', 
            transform: 'scale(1)', 
            boxShadow: '0 0 6px #ffffff, 0 0 12px #ffffff'
          },
          '50%': { 
            opacity: '1', 
            transform: 'scale(1.3)', 
            boxShadow: '0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff'
          },
          '100%': { 
            opacity: '0.5', 
            transform: 'scale(1.1)', 
            boxShadow: '0 0 8px #ffffff, 0 0 16px #ffffff'
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'farm-gradient': 'linear-gradient(135deg, rgba(143, 213, 227, 0.9) 0%, rgba(143, 213, 227, 0.7) 100%)',
        'farm-gradient-dark': 'linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.8) 100%)',
      },
    },
  },
  plugins: [],
}