/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        'primary-2': 'var(--primary-2)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        danger: 'var(--danger)',
      },
      boxShadow: {
        soft: '0 10px 28px rgba(0,0,0,.18)',
      },
    },
  },
  plugins: [],
}

