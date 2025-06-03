import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0070f3', // A vibrant blue
          dark: '#005bb5',
          darker: '#004a92',
        },
        secondary: {
          DEFAULT: '#ff4081', // A pink accent
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
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-lexend)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
}

export default config
