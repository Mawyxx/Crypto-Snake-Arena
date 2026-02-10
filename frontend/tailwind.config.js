/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#000000', // Pure black background
          surface: '#111111', // Dark grey surfaces
          surfaceAlt: '#1C1C1E', // iOS-style card surface
        },
        accent: {
          mint: '#26D07C', // Primary mint accent
          blue: '#007AFF', // System blue
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8E8E93',
        },
      },
    },
  },
  plugins: [],
}

