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
      borderRadius: {
        panel: '16px',
        control: '10px',
      },
      spacing: {
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        24: '24px',
        32: '32px',
      },
      boxShadow: {
        panel: '0 45px 70px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;
