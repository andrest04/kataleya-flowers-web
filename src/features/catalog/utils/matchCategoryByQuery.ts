import type { Category } from '@/features/catalog/types';

const MIN_QUERY_LENGTH = 3;

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function stem(value: string): string {
  if (value.length > 4 && value.endsWith('es')) return value.slice(0, -2);
  if (value.length > 3 && value.endsWith('s')) return value.slice(0, -1);
  return value;
}

export function matchCategoryByQuery(
  categories: Category[],
  query: string,
): Category | null {
  const needle = stem(normalize(query));
  if (needle.length < MIN_QUERY_LENGTH) return null;
  return (
    categories.find((category) => {
      const name = stem(normalize(category.name));
      return name.length >= MIN_QUERY_LENGTH && (name.includes(needle) || needle.includes(name));
    }) ?? null
  );
}
