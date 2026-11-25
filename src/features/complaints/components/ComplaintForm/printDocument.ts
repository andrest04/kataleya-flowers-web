const PRINT_CSP = "default-src 'none'; style-src 'unsafe-inline'";

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function printDocument(bodyHtml: string, complaintNumber: string): string {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${PRINT_CSP}"><title>Hoja de Reclamación ${escapeText(complaintNumber)}</title></head><body>${bodyHtml}</body></html>`;
}
