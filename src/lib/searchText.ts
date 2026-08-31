export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function matchesSearchText(haystack: string, needle: string): boolean {
  return normalizeSearchText(haystack).includes(normalizeSearchText(needle));
}
