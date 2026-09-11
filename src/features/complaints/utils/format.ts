export const RESPONSE_BUSINESS_DAYS = 15;

export function formatComplaintNumber(
  correlativo: number,
  createdAt: string | Date,
): string {
  const year = new Date(createdAt).getFullYear();
  return `${String(correlativo).padStart(5, '0')}-${year}`;
}

const FIXED_PERU_HOLIDAYS: readonly [month: number, day: number][] = [
  [0, 1],
  [4, 1],
  [5, 7],
  [5, 29],
  [6, 23],
  [6, 28],
  [6, 29],
  [7, 6],
  [7, 30],
  [9, 8],
  [10, 1],
  [11, 8],
  [11, 9],
  [11, 25],
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function isPeruvianHoliday(date: Date): boolean {
  if (
    FIXED_PERU_HOLIDAYS.some(
      ([month, day]) => date.getMonth() === month && date.getDate() === day,
    )
  ) {
    return true;
  }

  const easter = easterSunday(date.getFullYear());
  const holyThursday = new Date(easter);
  holyThursday.setDate(easter.getDate() - 3);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);

  return isSameDay(date, holyThursday) || isSameDay(date, goodFriday);
}

export function addBusinessDays(from: string | Date, days: number): Date {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6 && !isPeruvianHoliday(date)) added += 1;
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
