/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main theme colors to match HelloCopilot style
        primary: '#0A0A0A',
        secondary: '#FF5733', // Take Off - orange
        accent: '#5733FF',    // Indigo accent
        dark: '#000000',
        light: '#FFFFFF',
        
        // Category colors
        takeoff: {
          light: '#FF7E33',
          DEFAULT: '#FF5733',
          dark: '#CC4628'
        },
        touchdown: {
          light: '#3387FF',
          DEFAULT: '#2563EB',
          dark: '#1E40AF'
        },
        highpoint: {
          light: '#33FF9C',
          DEFAULT: '#10B981', 
          dark: '#047857'
        }
      },
      fontFamily: {
        sans: ['InterTest', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'reverse-spin': 'reverse-spin 10s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'reverse-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "url('/assets/grid-pattern.svg')",
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 87, 51, 0.5)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
      },
    },
  },
  plugins: [],
} 