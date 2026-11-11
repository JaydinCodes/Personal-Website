/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx,mdx}',
    './data/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        black: '#0B0B0F',
        surface: '#121217',
        white: '#F5F5F7',
        red: {
          500: '#E10600',
          600: '#C00500',
        },
        gray: {
          400: '#9CA3AF',
          600: '#4B5563',
        },
      },
      fontFamily: {
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
        display: ['var(--font-syne)', 'Syne', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.5rem',
      },
    },
  },
  plugins: [],
}
