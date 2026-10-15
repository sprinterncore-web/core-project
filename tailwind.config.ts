/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:       '#0A1628',
        blue:       '#2E6FF3',
        teal:       '#00C9A7',
        'teal-dark':'#006B58',
        slate:      '#64748B',
        canvas:     '#F4F7FB',
        surface:    '#FFFFFF',
        line:       '#E2E8F0',
        'teal-wash':'#EDFAF7',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
      },
      animation: {
        marquee:     'marquee 30s linear infinite',
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
