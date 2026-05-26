/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts}',
    './src/hooks/**/*.{js,ts}',
    './src/context/**/*.{js,ts,tsx}',
    './styles/**/*.{css}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1976d2',
        },
        secondary: {
          DEFAULT: '#dc004e',
        },
      },
      fontSize: {
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}

