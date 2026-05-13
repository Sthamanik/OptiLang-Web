/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── Map all CSS theme variables as Tailwind tokens ────────────────────
      // This makes bg-app, text-t1, border-border etc all theme-aware
      colors: {
        app:      'var(--bg0)',
        surface:  'var(--bg1)',
        surface2: 'var(--bg2)',
        surface3: 'var(--bg3)',
        border:   'var(--border)',
        t1:       'var(--t1)',
        t2:       'var(--t2)',
        t3:       'var(--t3)',
        accent:   'var(--accent)',
        acch:     'var(--acch)',
        ok:       'var(--green)',
        warn:     'var(--amber)',
        danger:   'var(--red)',
        teal:     'var(--teal)',
        purple:   'var(--purple)',
      },
      // ── Custom font sizes used in project ─────────────────────────────────
      fontSize: {
        '10': '10px',
        '11': '11px',
        '12': '12px',
        '13': '13px',
        '15': '15px',
        '17': '17px',
        '20': '20px',
        '26': '26px',
      },
      // ── Custom sizes ───────────────────────────────────────────────────────
      width: {
        '30': '30px',
        '22': '22px',
        '44': '44px',
        '200': '200px',
        '220': '220px',
        '300': '300px',
        '380': '380px',
        '400': '400px',
        '420': '420px',
        '480': '480px',
      },
      height: {
        '30':  '30px',
        '32':  '32px',
        '34':  '34px',
        '50':  '50px',
        '56':  '56px',
      },
      minWidth: {
        '80':  '80px',
        '16':  '16px',
        '18':  '18px',
      },
      // ── Custom animations — stay as CSS keyframes in index.css ─────────────
      animation: {
        'run-pulse':   'run-pulse 1s ease-in-out infinite',
        'run-success': 'run-success-pop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'run-shake':   'run-shake 0.35s ease',
        'flash-in':    'flash-in 0.2s ease',
        'spin-slow':   'spin 0.7s linear infinite',
        'fade-in':     'fadeIn 0.15s ease',
        'slide-up':    'slideUp 0.18s ease',
      },
      // ── Custom box shadows ─────────────────────────────────────────────────
      boxShadow: {
        'modal':   '0 24px 48px rgba(0,0,0,0.5)',
        'modal-lg':'0 24px 60px rgba(0,0,0,0.6)',
        'dropdown':'0 8px 32px rgba(0,0,0,0.4)',
        'success': '0 0 12px rgba(29,158,117,0.5)',
        'error':   '0 0 12px rgba(226,75,74,0.5)',
      },
      // ── Custom letter spacing ──────────────────────────────────────────────
      letterSpacing: {
        'tight-sm': '-0.3px',
        'tight-md': '-0.5px',
      },
      // ── Custom transitions ─────────────────────────────────────────────────
      transitionProperty: {
        'sidebar': 'width',
        'panel':   'transform, opacity',
      },
      transitionDuration: {
        '220': '220ms',
        '250': '250ms',
      },
      transitionTimingFunction: {
        'sidebar': 'cubic-bezier(0.4,0,0.2,1)',
      },
      // ── Grid templates ─────────────────────────────────────────────────────
      gridTemplateColumns: {
        'stat':    'repeat(2, 1fr)',
        'hot':     '36px 1fr 44px 64px',
        'hist':    '36px 1fr 44px 64px',
      },
    },
  },
  plugins: [],
}
