/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SOC Terminal palette
        soc: {
          bg:        '#080c18',
          surface:   '#0d1117',
          panel:     '#111827',
          border:    '#1e293b',
          green:     '#00ff9f',
          cyan:      '#00d4ff',
          blue:      '#3b82f6',
          yellow:    '#facc15',
          red:       '#ff3b30',
          muted:     '#4b5563',
          text:      '#e2e8f0',
          subtext:   '#94a3b8',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'glow-green':  '0 0 12px rgba(0,255,159,0.35)',
        'glow-cyan':   '0 0 12px rgba(0,212,255,0.35)',
        'glow-red':    '0 0 12px rgba(255,59,48,0.4)',
        'glow-yellow': '0 0 12px rgba(250,204,21,0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.35s ease-out',
        'blink':      'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        blink:   { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
      },
    },
  },
  plugins: [],
}
