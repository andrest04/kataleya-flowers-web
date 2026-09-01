export interface Publishable {
  ends_at: string | null;
  is_active: boolean;
  starts_at: string | null;
}

export function isPublished(row: Publishable, now: Date = new Date()): boolean {
  if (!row.is_active) return false;
  if (row.starts_at && now < new Date(row.starts_at)) return false;
  if (row.ends_at && now > new Date(row.ends_at)) return false;
  return true;
}
