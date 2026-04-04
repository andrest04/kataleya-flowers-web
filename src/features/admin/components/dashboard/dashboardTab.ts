export const DASHBOARD_TABS = [
  'resumen',
  'catalogo',
  'productos',
  'analiticas',
] as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[number];

export const DEFAULT_DASHBOARD_TAB: DashboardTab = 'resumen';

export function parseDashboardTab(
  value: string | string[] | undefined,
): DashboardTab {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return (
    DASHBOARD_TABS.find((tab) => tab === rawValue) ?? DEFAULT_DASHBOARD_TAB
  );
}
