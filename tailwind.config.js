/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts}',
    './src/hooks/**/*.{js,ts}',
    './src/context/**/*.{js,ts,tsx}',
    './styles/**/*.{css}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

