import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B8F5C',
          light: '#4CAF7D',
          dark: '#2A6B43',
        },
        secondary: {
          DEFAULT: '#F8B64C',
          light: '#FFCA71',
          dark: '#E09A2D',
        },
        neutral: {
          50: '#F9F9F9',
          100: '#F3F3F3',
          200: '#E7E7E7',
          300: '#D1D1D1',
          400: '#ADADAD',
          500: '#888888',
          600: '#636363',
          700: '#4D4D4D',
          800: '#363636',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
}

export default config
