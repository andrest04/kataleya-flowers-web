const TWELVE_HOUR_TIME = /\b(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s?m\b\.?/gi;
const TIME_RANGE =
  /(\d{1,2}(?::\d{2})? [ap]\. m\.)\s*[-–]\s*(?=\d{1,2}(?::\d{2})? [ap]\. m\.)/g;

export function formatHours(text: string): string {
  return text
    .replace(TWELVE_HOUR_TIME, (_match, hour: string, minutes: string | undefined, meridiem: string) => {
      const clock = minutes ? `${hour}:${minutes}` : hour;
      return `${clock} ${meridiem.toLowerCase()}. m.`;
    })
    .replace(TIME_RANGE, '$1 – ');
}
