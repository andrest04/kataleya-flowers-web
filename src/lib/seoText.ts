const ELLIPSIS = '…';
const TRAILING_PUNCTUATION = /[\s,;:.\-–—]+$/;

export function truncateOnWord(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const budget = normalized.slice(0, maxLength - ELLIPSIS.length + 1);
  const boundary = budget.lastIndexOf(' ');
  const cut = boundary > 0 ? budget.slice(0, boundary) : budget.slice(0, maxLength - ELLIPSIS.length);
  return `${cut.replace(TRAILING_PUNCTUATION, '')}${ELLIPSIS}`;
}
