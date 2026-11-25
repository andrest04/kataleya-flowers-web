export type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

const SCRIPT_UNSAFE_CHARACTER = /[<>&\u2028\u2029]/g;

function toUnicodeEscape(character: string): string {
  return `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`;
}

export function serializeJsonLd(data: JsonLdData): string {
  return JSON.stringify(data).replace(SCRIPT_UNSAFE_CHARACTER, toUnicodeEscape);
}
