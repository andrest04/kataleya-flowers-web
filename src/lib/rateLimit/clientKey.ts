interface HeaderSource {
  get(name: string): string | null;
}

const UNKNOWN_CLIENT = 'unknown';
const IPV4_PATTERN = /^\d{1,3}(?:\.\d{1,3}){3}$/;
const IPV4_WITH_PORT_PATTERN = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/;
const BRACKETED_IPV6_PATTERN = /^\[([^\]]+)\](?::\d+)?$/;
const ZONE_ID_PATTERN = /%.*$/;
const HEXTET_PATTERN = /^[0-9a-f]{1,4}$/;
const IPV6_GROUP_COUNT = 8;
const PREFIX_64_GROUP_COUNT = 4;
const MAX_OCTET = 255;
const OCTET_BASE = 256;

function firstHop(headers: HeaderSource): string {
  const forwardedHop = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const candidate = forwardedHop || headers.get('x-real-ip')?.trim();
  return candidate ? candidate.toLowerCase() : '';
}

function stripPort(address: string): string {
  const bracketed = BRACKETED_IPV6_PATTERN.exec(address);
  if (bracketed) return bracketed[1];
  const ipv4WithPort = IPV4_WITH_PORT_PATTERN.exec(address);
  if (ipv4WithPort) return ipv4WithPort[1];
  return address;
}

function ipv4ToHextets(ipv4: string): string[] | null {
  if (!IPV4_PATTERN.test(ipv4)) return null;
  const octets = ipv4.split('.').map(Number);
  if (octets.some((octet) => octet > MAX_OCTET)) return null;
  return [
    (octets[0] * OCTET_BASE + octets[1]).toString(16),
    (octets[2] * OCTET_BASE + octets[3]).toString(16),
  ];
}

function hextetsToIpv4(high: string, low: string): string {
  const highValue = parseInt(high, 16);
  const lowValue = parseInt(low, 16);
  return [
    Math.floor(highValue / OCTET_BASE),
    highValue % OCTET_BASE,
    Math.floor(lowValue / OCTET_BASE),
    lowValue % OCTET_BASE,
  ].join('.');
}

function parseGroups(part: string): string[] | null {
  if (part === '') return [];
  const groups = part.split(':');
  const last = groups[groups.length - 1];
  if (!last.includes('.')) return groups;
  const embedded = ipv4ToHextets(last);
  return embedded ? [...groups.slice(0, -1), ...embedded] : null;
}

function expandIpv6(address: string): string[] | null {
  const halves = address.replace(ZONE_ID_PATTERN, '').split('::');
  if (halves.length > 2) return null;

  const head = parseGroups(halves[0]);
  const tail = halves.length === 2 ? parseGroups(halves[1]) : [];
  if (!head || !tail) return null;

  const missing = IPV6_GROUP_COUNT - head.length - tail.length;
  const isCompressed = halves.length === 2;
  if (isCompressed ? missing < 1 : missing !== 0) return null;

  const groups = [...head, ...Array.from({ length: missing }, () => '0'), ...tail];
  if (!groups.every((group) => HEXTET_PATTERN.test(group))) return null;
  return groups.map((group) => parseInt(group, 16).toString(16));
}

function isIpv4Mapped(groups: string[]): boolean {
  return groups.slice(0, 5).every((group) => group === '0') && groups[5] === 'ffff';
}

function normalizeAddress(rawAddress: string): string {
  const address = stripPort(rawAddress);
  if (!address.includes(':')) return address;

  const groups = expandIpv6(address);
  if (!groups) return address;
  if (isIpv4Mapped(groups)) return hextetsToIpv4(groups[6], groups[7]);
  return `${groups.slice(0, PREFIX_64_GROUP_COUNT).join(':')}::/64`;
}

export function clientKeyFromHeaders(headers: HeaderSource): string {
  const hop = firstHop(headers);
  return hop ? normalizeAddress(hop) : UNKNOWN_CLIENT;
}
