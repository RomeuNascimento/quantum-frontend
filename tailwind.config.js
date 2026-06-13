/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:     '#0B0B0F',
        bone:    '#F4EFE3',
        lime:    '#D6FF3F',
        'lime-dim': '#B8E520',
        plasma:  '#1A1B20',
        rust:    '#A63D22',
        receipt: '#EBE5D6',
        line:    '#D9D2BF',
        mute:    '#5A584F',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
