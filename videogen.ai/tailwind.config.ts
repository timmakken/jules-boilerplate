import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0070f3', // Example: A vibrant blue
          dark: '#005bb5',
        },
        secondary: {
          DEFAULT: '#ff4081', // Example: A pink accent
          dark: '#c60055',
        },
        neutral: {
          lightest: '#f5f5f5',
          lighter: '#e0e0e0',
          DEFAULT: '#9e9e9e',
          darker: '#424242',
          darkest: '#212121',
        },
        background: '#ffffff', // For a light theme
        foreground: '#111111', // For a light theme text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example: Inter font
        heading: ['Lexend', 'sans-serif'], // Example: Lexend for headings
      },
      animation: {
        fadeInUp: 'fadeInUp 0.7s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
