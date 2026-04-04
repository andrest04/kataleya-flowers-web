export const ANALYTICS_RANGE_OPTIONS = [7, 30, 90] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGE_OPTIONS)[number];

const DEFAULT_ANALYTICS_RANGE: AnalyticsRange = 30;

export function parseAnalyticsRange(value: string | string[] | undefined): AnalyticsRange {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue);

  return ANALYTICS_RANGE_OPTIONS.find((range) => range === parsedValue) ?? DEFAULT_ANALYTICS_RANGE;
}
