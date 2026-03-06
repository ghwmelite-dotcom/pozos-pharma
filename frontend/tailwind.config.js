/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#4F46E5',
          teal: '#0D9488',
          emerald: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B'
        },
        ghana: {
          red: '#CE1126',
          gold: '#FCD116',
          green: '#006B3F',
          star: '#000000'
        },
        surface: {
          light: '#F5F2EB',
          dark: '#0F172A',
          card: '#FDFBF7',
          'card-dark': '#1E293B'
        },
        warm: {
          50: '#FAF8F3',
          100: '#F5F2EB',
          200: '#EBE6DA',
          300: '#DDD6C5',
          400: '#C4B899',
          500: '#A89A76',
          600: '#8B7D5E',
          700: '#6E6349',
          800: '#524A37',
          900: '#383225',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
        body: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      backgroundImage: {
        'kente-pattern': `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(252, 209, 22, 0.05) 10px,
          rgba(252, 209, 22, 0.05) 20px
        )`,
        'kente-accent': `repeating-linear-gradient(
          90deg,
          #CE1126 0px, #CE1126 4px,
          #FCD116 4px, #FCD116 8px,
          #006B3F 8px, #006B3F 12px,
          #FCD116 12px, #FCD116 16px
        )`
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out both'
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
};
