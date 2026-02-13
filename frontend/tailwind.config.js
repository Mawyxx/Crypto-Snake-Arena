/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'neon-green': 'var(--color-success)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        anthracite: 'var(--anthracite)',
        'neon-blue': '#00F0FF',
        card: 'var(--bg-card)',
        bg: {
          main: 'var(--bg-main)',
          surface: 'var(--anthracite)',
          surfaceAlt: 'var(--bg-surface-alt)',
          card: 'var(--bg-card)',
        },
        accent: {
          mint: 'var(--accent-mint)',
          blue: 'var(--primary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
      },
    },
  },
  plugins: [],
}

