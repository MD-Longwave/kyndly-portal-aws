/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Official Kyndly brand colors from brand guidelines
        night: {
          DEFAULT: '#0E2C3A', // Pantone 5395
          50: '#E6EBF0',
          100: '#CCD8E1',
          200: '#99B0C2',
          300: '#6689A4',
          400: '#476F8E',
          500: '#2A5573',
          600: '#1A4459',
          700: '#163A4C',
          800: '#122F3D',
          900: '#0E2631',
          950: '#0A1C24',
        },
        moss: {
          DEFAULT: '#0B4E4A', // Pantone 316
          50: '#F2FAFA',
          100: '#E6F6F4',
          200: '#D1EEE9',
          300: '#B9E5DE',
          400: '#A2DCD3',
          500: '#3F9185',
          600: '#327971',
          700: '#274D4A',
          800: '#1C3634',
          900: '#142726',
          950: '#0A1A19',
        },
        seafoam: {
          DEFAULT: '#6BC5A7', // Pantone 338
          50: '#F5FBF9',
          100: '#E2F4EF',
          200: '#C5E9DF',
          300: '#A9DFCF',
          400: '#8DD4BF',
          500: '#6BC5A7',
          600: '#45B48F',
          700: '#369173',
          800: '#276F58',
          900: '#1B4E3D',
          950: '#133229',
        },
        sky: {
          DEFAULT: '#8BD4E1', // Pantone 636
          50: '#F6FCFD',
          100: '#E7F6F9',
          200: '#CFEDF3',
          300: '#B7E3ED',
          400: '#9FDCE7',
          500: '#8BD4E1',
          600: '#52C1D6',
          700: '#30A7BE',
          800: '#258093',
          900: '#1A5A67',
          950: '#123C44',
        },
        // Maintain alias to primary and secondary for existing code compatibility
        primary: {
          DEFAULT: '#6BC5A7', // Map to seafoam as primary
          50: '#F5FBF9',
          100: '#E2F4EF',
          200: '#C5E9DF',
          300: '#A9DFCF',
          400: '#8DD4BF',
          500: '#6BC5A7', // Main teal color
          600: '#45B48F',
          700: '#369173',
          800: '#276F58',
          900: '#1B4E3D',
          950: '#133229',
        },
        secondary: {
          DEFAULT: '#0E2C3A', // Map to night as secondary
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
        // Additional utility colors
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
        // Legacy color names for backward compatibility
        mint: '#F2FAFA',  // Light mint background
        teal: '#6BC5A7',  // Seafoam
        forest: '#0B4E4A', // Moss
        navy: '#0E2C3A',  // Night
        // Dark mode specific colors
        dark: {
          bg: '#0E2C3A',        // Night color as dark background
          surface: '#1A4459',   // Night-600 as dark surface
          border: '#163A4C',    // Night-700 as dark border
          text: '#F8FAFC',      // Dark mode text
          muted: '#CCD8E1',     // Night-100 as muted text
          highlight: '#6BC5A7'  // Seafoam as highlight
        }
      },
      fontFamily: {
        // Add Liebling as the primary font with appropriate fallbacks
        sans: ['Liebling', 'Inter', 'system-ui', 'sans-serif'],
        liebling: ['Liebling', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // Add the teal-to-navy gradient from the brand guidelines
        'brand-gradient': 'linear-gradient(90deg, #0B4E4A 0%, #0E2C3A 100%)',
        'brand-gradient-vertical': 'linear-gradient(180deg, #0B4E4A 0%, #0E2C3A 100%)',
        // Dark mode gradients with slight adjustments
        'dark-gradient': 'linear-gradient(90deg, #0A1A19 0%, #0A1C24 100%)',
        'dark-gradient-vertical': 'linear-gradient(180deg, #0A1A19 0%, #0A1C24 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'brand': '0 4px 14px rgba(14, 44, 58, 0.15)',
        'dark': '0 4px 14px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'brand': '0.5rem',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#0E2C3A', // Night color for text
            h1: {
              color: '#0E2C3A', // Night color for headings
              fontWeight: 700,  // Liebling Bold for h1
            },
            h2: {
              color: '#0E2C3A',
              fontWeight: 600,  // Liebling Medium for h2
            },
            h3: {
              color: '#0E2C3A',
              fontWeight: 600,  // Liebling Medium for h3
            },
            a: {
              color: '#6BC5A7', // Seafoam color for links
              '&:hover': {
                color: '#45B48F', // Seafoam-600 for hover state
              },
            },
          },
        },
        // Add dark mode typography settings
        dark: {
          css: {
            color: '#F8FAFC', // Light text for dark mode
            h1: {
              color: '#F8FAFC',
              fontWeight: 700,
            },
            h2: {
              color: '#F8FAFC',
              fontWeight: 600,
            },
            h3: {
              color: '#F8FAFC',
              fontWeight: 600,
            },
            a: {
              color: '#8BD4E1', // Sky color for dark mode links
              '&:hover': {
                color: '#52C1D6', // Sky-600 for hover state
              },
            },
            strong: {
              color: '#8BD4E1', // Sky color for emphasis in dark mode
            },
            blockquote: {
              color: '#CCD8E1', // Night-100 for blockquotes
              borderLeftColor: '#3F9185', // Moss-500
            },
            code: {
              color: '#8BD4E1', // Sky color for code
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Add typography plugin if needed
    // Plugin to add dark mode utilities
    function({ addBase, addUtilities, theme }) {
      addBase({
        // Base dark mode styles
        '.dark': {
          'color-scheme': 'dark',
          '--bg-main': theme('colors.night.950'),
          '--bg-surface': theme('colors.night.900'),
          '--text-primary': theme('colors.neutral.100'),
          '--text-secondary': theme('colors.neutral.300'),
          '--border-color': theme('colors.night.700'),
        },
        'body.dark': {
          backgroundColor: 'var(--bg-main)',
          color: 'var(--text-primary)',
        }
      });
      
      addUtilities({
        '.bg-dark-surface': {
          backgroundColor: 'var(--bg-surface)',
        },
        '.text-dark-primary': {
          color: 'var(--text-primary)',
        },
        '.text-dark-secondary': {
          color: 'var(--text-secondary)',
        },
        '.border-dark': {
          borderColor: 'var(--border-color)',
        },
      });
    }
  ],
} 