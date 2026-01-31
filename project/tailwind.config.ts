import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--surface-base)',
        panel: 'var(--surface-panel)',
        panelAlt: 'var(--surface-panel-alt)',
        panelTeal: 'var(--surface-panel-teal)',
        textPrimary: 'var(--text-primary)',
        textMuted: 'var(--text-muted)',
        textMutedAlt: 'var(--text-muted-alt)',
        accent: 'var(--accent-cyan)',
        divider: 'var(--divider-color)',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        panel: '0 45px 70px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;
