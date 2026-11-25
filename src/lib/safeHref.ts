function hasUnsafeCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f || code === 0x5c) return true;
  }
  return false;
}

function isSitePath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}

function isFragment(value: string): boolean {
  return value.startsWith('#') && value.length > 1;
}

export function isExternalHttpsHref(value: string): boolean {
  if (hasUnsafeCharacter(value) || !value.startsWith('https://')) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isSafeSiteHref(value: string): boolean {
  if (hasUnsafeCharacter(value)) return false;
  return isSitePath(value) || isFragment(value) || isExternalHttpsHref(value);
}
