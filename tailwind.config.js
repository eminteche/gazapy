/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'rose': {
          700: '#be123c',
        },
        'purple': {
          800: '#6b21a8',
        },
        'fuchsia': {
          900: '#701a75',
        },
      },
    },
  },
  plugins: [],
}

