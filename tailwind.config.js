/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px'
    },
    extend: {
      colors: {
        'blue': '#0000ff',
      },
      fontFamily: {
        monumentregular: ['monumentregular'],
        monumentbold: ['monumentbold']
      },
      keyframes: {
        fadeInFadeOut: {
          '0%': { opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0 }
        },
        moveAround: {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(100px, -50px)' },
          '50%': { transform: 'translate(-100px, 100px)' },
          '75%': { transform: 'translate(-50px, -100px)' },
          '100%': { transform: 'translate(0, 0)' }
        }
      },
      animation: {
        fadeInFadeOut: 'fadeInFadeOut 5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};