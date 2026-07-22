export const RESPONSE_BUSINESS_DAYS = 15;

export function formatComplaintNumber(
  correlativo: number,
  createdAt: string | Date,
): string {
  const year = new Date(createdAt).getFullYear();
  return `${String(correlativo).padStart(5, '0')}-${year}`;
}

export function addBusinessDays(from: string | Date, days: number): Date {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return date;
}

export function responseDeadline(createdAt: string | Date): Date {
  return addBusinessDays(createdAt, RESPONSE_BUSINESS_DAYS);
}

export function isResponseOverdue(
  createdAt: string | Date,
  respondedAt: string | null,
): boolean {
  if (respondedAt) return false;
  return new Date() > responseDeadline(createdAt);
}
