export function promoPresetKey(banner: { id: string; name: string | null }): string {
  return banner.name?.trim() || banner.id;
}
