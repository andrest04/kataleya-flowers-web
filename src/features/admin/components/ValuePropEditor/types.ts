export type ValuePropDestinationMode = 'anchor' | 'external' | 'route';

export interface ValuePropDraft {
  description: string;
  endsAt: string;
  href: string;
  icon: string;
  isActive: boolean;
  isAnchor: boolean;
  isExternal: boolean;
  linkLabel: string;
  startsAt: string;
  title: string;
}

export function destinationModeFromFlags(
  isAnchor: boolean,
  isExternal: boolean,
): ValuePropDestinationMode {
  if (isAnchor) return 'anchor';
  if (isExternal) return 'external';
  return 'route';
}

export function flagsFromDestinationMode(
  mode: ValuePropDestinationMode,
): Pick<ValuePropDraft, 'isAnchor' | 'isExternal'> {
  return {
    isAnchor: mode === 'anchor',
    isExternal: mode === 'external',
  };
}
