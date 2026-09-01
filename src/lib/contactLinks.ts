export function whatsappUrl(phone: string): string {
  return `https://wa.me/${phone}`;
}

export function whatsappWithMessage(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function instagramUrl(handle: string): string {
  const username = handle.replace(/^@/, '');
  return `https://instagram.com/${username}`;
}

export function interpolateProductMessage(template: string, productName: string): string {
  return template.replaceAll('{nombre}', productName);
}
