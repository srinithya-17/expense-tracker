/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F1EFFE',
          100: '#E4DFFD',
          200: '#C9BFFB',
          300: '#AD9FF9',
          400: '#8B7EF3',
          500: '#6C5CE7',
          600: '#5849C4',
          700: '#463A9C',
          800: '#342B73',
          900: '#221C4D',
        },
        mint: {
          400: '#33E5B8',
          500: '#00D9A3',
          600: '#00B588',
        },
        coral: {
          400: '#FF8888',
          500: '#FF6B6B',
          600: '#E85050',
        },
        gold: {
          400: '#FFC670',
          500: '#FFB84D',
          600: '#F0A020',
        },
        ink: {
          50: '#F7F8FC',
          100: '#EDEFF6',
          200: '#D8DBE6',
          300: '#B0B5C9',
          400: '#8B93A7',
          500: '#646C82',
          600: '#454C60',
          700: '#2E3346',
          800: '#1C1F2E',
          850: '#151824',
          900: '#0F111A',
          950: '#0B0E17',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(15, 17, 26, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.35)',
        glow: '0 0 40px rgba(108, 92, 231, 0.25)',
        'glow-mint': '0 0 40px rgba(0, 217, 163, 0.25)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(at 20% 20%, rgba(108,92,231,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0,217,163,0.12) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(255,184,77,0.10) 0px, transparent 50%)',
        'mesh-dark':
          'radial-gradient(at 20% 20%, rgba(108,92,231,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0,217,163,0.18) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(255,184,77,0.12) 0px, transparent 50%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite 1s',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
