/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F2FAFA',
          100: '#E6F6F4',
          200: '#D1EEE9',
          300: '#B9E5DE',
          400: '#A2DCD3',
          500: '#81C7BB', // Main teal color
          600: '#6BB5A9',
          700: '#55A397',
          800: '#3F9185',
          900: '#297F73',
          950: '#1C6D61',
        },
        secondary: {
          50: '#E6EBF0',
          100: '#CCD8E1',
          200: '#99B0C2',
          300: '#6689A4',
          400: '#476F8E',
          500: '#2A5573',
          600: '#1A4459',
          700: '#163A4C',
          800: '#122F3D', // Main dark blue color
          900: '#0E2631',
          950: '#0A1C24',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        mint: '#E6F6F4',  // Light mint background
        teal: '#81C7BB',  // Teal accent
        navy: '#122F3D',  // Dark navy text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
} 