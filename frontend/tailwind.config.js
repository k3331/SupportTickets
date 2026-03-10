/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        'priority-low': 'var(--priority-low)',
        'priority-medium': 'var(--priority-medium)',
        'priority-high': 'var(--priority-high)',
        'status-new': 'var(--status-new)',
        'status-investigating': 'var(--status-investigating)',
        'status-resolved': 'var(--status-resolved)',
      },
      borderRadius: {
        card: 'var(--radius)',
      },
      keyframes: {
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        'modal-slide': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(-0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        spin: 'spin 0.8s linear infinite',
        'modal-slide': 'modal-slide 0.2s ease-out',
        'toast-in': 'toast-in 0.25s ease-out',
      },
      minHeight: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};
