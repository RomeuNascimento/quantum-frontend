/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Kitchen Metrics · Soft Minimalist (claro, navy/slate/dourado) ──
        surface:            '#F8F9FA', // fundo base (canvas)
        'surface-1':        '#F3F4F5', // inputs / seções rebaixadas
        'surface-2':        '#EDEEEF', // containers sutis
        card:               '#FFFFFF', // superfície de card (branco puro)
        'on-surface':       '#191C1D', // texto principal
        'on-surface-dim':   '#45474D', // texto secundário
        outline:            '#DEE2E6', // bordas estruturais (1px, sem sombra)
        'outline-strong':   '#C5C6CD',
        primary:            '#051125', // navy — nav, títulos, ênfase
        'on-primary':       '#FFFFFF',
        'primary-soft':     '#1B263B',
        secondary:          '#47607E', // slate — dados de apoio
        accent:             '#A5652B', // dourado/terracota — AÇÕES (só highlights)
        'accent-soft':      '#F9BA77', // dourado claro — preenchimentos/realces
        'on-accent':        '#FFFFFF',
        positive:           '#3F7D5B', // verde-sálvia — status "saudável"
        'positive-bg':      '#DCEEE3', // fundo de badge saudável
        info:               '#C2DCFF', // azul-claro — badge "Saudável/Estoque Alto"
        'on-info':          '#2F4865',
        warm:               '#FFDCBB', // pêssego — badge "Revisar/Reposição/Atenção"
        'on-warm':          '#673D02',
        danger:             '#BA1A1A', // erro / valor negativo
        'danger-bg':        '#FFDAD6', // fundo de erro
        'on-danger-bg':     '#93000A',

        // ── Legado remapeado (tema claro → quase drop-in do original) ──
        ink:      '#191C1D', // texto near-black
        bone:     '#F8F9FA', // fundo claro / texto claro sobre navy
        lime:     '#A5652B', // acento → dourado
        'lime-dim': '#8A5522',
        plasma:   '#1B263B', // superfície navy sutil
        rust:     '#BA1A1A', // erro
        receipt:  '#FFFFFF', // card branco
        line:     '#DEE2E6', // bordas
        mute:     '#45474D', // texto secundário
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Work Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      },
    },
  },
  plugins: [],
}
