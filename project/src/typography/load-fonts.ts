import type { FontLoadingPlan, FontWeight } from '@domain/typography';

type FontImporter = () => Promise<unknown>;
type FontLoaderRegistry = Record<string, Partial<Record<FontWeight, FontImporter>>>;

const FONT_LOADERS: FontLoaderRegistry = {
  'IBM Plex Mono': {
    400: () => import('@fontsource/ibm-plex-mono/400.css'),
    500: () => import('@fontsource/ibm-plex-mono/500.css'),
    600: () => import('@fontsource/ibm-plex-mono/600.css'),
  },
  'JetBrains Mono': {
    400: () => import('@fontsource/jetbrains-mono/400.css'),
    500: () => import('@fontsource/jetbrains-mono/500.css'),
    600: () => import('@fontsource/jetbrains-mono/600.css'),
  },
};

const loadedKeys = new Set<string>();

export async function loadFontsFromPlan(plans: readonly FontLoadingPlan[]): Promise<void> {
  const pendingImports: Promise<unknown>[] = [];

  plans.forEach((plan) => {
    plan.weights.forEach((weight) => {
      const key = `${plan.family}-${weight}`;
      if (loadedKeys.has(key)) {
        return;
      }

      const importer = FONT_LOADERS[plan.family]?.[weight];
      if (!importer) {
        if (import.meta.env.DEV) {
          console.warn(`Missing font importer for ${plan.family} weight ${weight}`);
        }
        return;
      }

      loadedKeys.add(key);
      pendingImports.push(importer());
    });
  });

  await Promise.all(pendingImports);
}
