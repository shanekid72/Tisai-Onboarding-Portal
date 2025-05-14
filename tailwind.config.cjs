/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#111111",
        secondary: "#FF5733",
        accent: "#5733FF",
        dark: "#0A0A0A",
        light: "#FFFFFF",
        black: "#000000",
        "black-light": "#0A0A0A",
        "black-lighter": "#111111",
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          '"Open Sans"',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        mono: [
          '"Fira Code"',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.light"),
            a: {
              color: theme("colors.secondary"),
              "&:hover": {
                color: theme("colors.secondary"),
              },
            },
            h1: {
              color: theme("colors.light"),
            },
            h2: {
              color: theme("colors.light"),
            },
            h3: {
              color: theme("colors.light"),
            },
            h4: {
              color: theme("colors.light"),
            },
            strong: {
              color: theme("colors.light"),
            },
            code: {
              color: theme("colors.light"),
            },
            blockquote: {
              color: theme("colors.light"),
            },
          },
        },
      }),
    },
  },
  plugins: [],
} 