import { useMemo, useState } from 'react';
import { getColorPalette } from '@domain/color-palette';
import { createLayoutPlan } from '@domain/layout';
import { formatFontStack, planFontLoading } from '@domain/typography';

const palette = getColorPalette();
const surfaceTokens = Object.values(palette.surfaces);
const textTokens = Object.values(palette.text);
const fontPlans = planFontLoading();
const fontStack = formatFontStack();

const viewportPresets = [
  { label: 'Mobile', width: 360 },
  { label: 'Tablet', width: 768 },
  { label: 'Desktop', width: 1280 },
] as const;

export default function App() {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth
  );

  const layoutPlan = useMemo(() => createLayoutPlan(viewportWidth), [viewportWidth]);

  return (
    <main className="min-h-screen bg-base text-textPrimary flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl space-y-12 rounded-3xl border border-[#2B2C2D66] bg-panel p-10 shadow-panel">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-textMuted">Build-ready preview</p>
          <h1 className="text-3xl font-semibold">Calm TODO playground</h1>
          <p className="text-textMuted">
            Spec-driven helpers feed this preview so we can run `pnpm dev`, lint, and type-check before wiring the
            actual task experience.
          </p>
          <div className="flex flex-wrap gap-3">
            {viewportPresets.map((preset) => {
              const isActive = preset.width === viewportWidth;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setViewportWidth(preset.width)}
                  aria-pressed={isActive}
                  className={`rounded-full border px-4 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7299A2] ${
                    isActive
                      ? 'border-[#7299A2] bg-[#132E2C] text-textPrimary'
                      : 'border-[#2B2C2D66] text-textMuted hover:border-[#7299A2] hover:text-textPrimary'
                  }`}
                >
                  {preset.label} · {preset.width}px
                </button>
              );
            })}
          </div>
        </header>

        <section className="grid gap-6 rounded-2xl border border-[#2B2C2D66] bg-panelAlt p-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-textMuted">Layout plan</span>
            <h2 className="text-2xl font-medium">Viewport-aware panel</h2>
            <p className="text-textMuted">
              {layoutPlan.panel.alignment === 'center'
                ? 'Centered panel with generous padding'
                : 'Full-width mobile panel with 16px gutters'}{' '}
              &middot; radius {layoutPlan.panel.radiusPx}px &middot; border {layoutPlan.panel.border.widthPx}px @
              {` ${layoutPlan.panel.border.colorHex} / ${Math.round(layoutPlan.panel.border.opacity * 100)}%`}
            </p>
            <p className="text-textMuted">
              Responsive rule: ≤{layoutPlan.responsive.maxViewportWidthPx}px keeps {layoutPlan.responsive.sidePaddingPx}
              px side padding.
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {layoutPlan.sections.map((section) => (
              <div
                key={section.id}
                className="rounded-xl border border-[#2B2C2D66] bg-panel p-4 text-textMutedAlt"
              >
                <p className="text-base text-textPrimary capitalize">{section.id}</p>
                <p>Order {section.order}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-[#2B2C2D66] bg-panelAlt p-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-textMuted">Color tokens</span>
              <h2 className="text-2xl font-medium">Surfaces & text</h2>
              <p className="text-textMuted">Mint and muted tones map directly from the spec palette.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {surfaceTokens.map((token) => (
                <article
                  key={token.id}
                  className="rounded-xl border border-[#2B2C2D66] bg-panel p-4"
                  style={{ background: token.hex }}
                >
                  <p className="text-sm uppercase tracking-wide text-textMuted">{token.intent}</p>
                  <p className="text-lg font-medium">{token.id}</p>
                  <p className="text-xs text-textMuted">{token.hex}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-textMuted">Font system</span>
              <h2 className="text-2xl font-medium">Typography stack</h2>
              <p className="text-textMuted">{fontStack}</p>
            </div>
            <ul className="space-y-3">
              {fontPlans.map((plan) => (
                <li key={plan.family} className="rounded-xl border border-[#2B2C2D66] bg-panel p-4">
                  <p className="text-lg font-medium">{plan.family}</p>
                  <p className="text-sm text-textMuted">Weights: {plan.weights.join(', ')}</p>
                  <p className="text-xs text-textMuted">Display mode: {plan.display}</p>
                </li>
              ))}
            </ul>
            <div className="grid gap-3 sm:grid-cols-2">
              {textTokens.map((token) => (
                <article key={token.id} className="rounded-xl border border-[#2B2C2D66] bg-panel p-4">
                  <p className="text-lg font-medium" style={{ color: token.hex }}>
                    {token.id}
                  </p>
                  <p className="text-xs text-textMuted">{token.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[#2B2C2D66] bg-panelTeal p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-textMuted">Ready to build</p>
          <p className="text-xl text-textPrimary">
            Run <code className="rounded bg-panel px-2 py-1">pnpm dev</code> to boot Vite, and pair it with{' '}
            <code className="rounded bg-panel px-2 py-1">pnpm lint</code> plus <code className="rounded bg-panel px-2 py-1">pnpm typecheck</code> for the spec-compliant feedback loop.
          </p>
        </section>
      </div>
    </main>
  );
}
