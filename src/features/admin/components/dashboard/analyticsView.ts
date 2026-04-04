export const ANALYTICS_VIEWS = ['conversion', 'trafico'] as const;

export type AnalyticsView = (typeof ANALYTICS_VIEWS)[number];

export function parseAnalyticsView(rawValue: string | string[] | undefined): AnalyticsView {
  if (Array.isArray(rawValue)) {
    return parseAnalyticsView(rawValue[0]);
  }

  return ANALYTICS_VIEWS.find((view) => view === rawValue) ?? 'conversion';
}
