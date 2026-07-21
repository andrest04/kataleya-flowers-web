import { BUSINESS } from '@/lib/constants';

import type { ComplaintFormData } from '../schemas/complaint';
import { RESPONSE_BUSINESS_DAYS } from '../utils/format';

export interface ComplaintEmailData extends ComplaintFormData {
  complaintNumber: string;
  createdAt: string | Date;
}

interface EmailContent {
  subject: string;
  html: string;
}

const BRAND = '#c0392b';
const ACCENT = '#2d5a1b';

const TYPE_LABEL: Record<ComplaintFormData['complaintType'], string> = {
  RECLAMO: 'Reclamo (disconformidad con el producto o servicio)',
  QUEJA: 'Queja (malestar respecto a la atención)',
};

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Escapa HTML — todo dato de `ComplaintEmailData` viene del formulario público. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#666;font-size:13px;vertical-align:top;white-space:nowrap;">${label}</td>
    <td style="padding:6px 0;color:#1a1a1a;font-size:14px;">${value}</td>
  </tr>`;
}

function hojaTable(data: ComplaintEmailData): string {
  const amount =
    data.claimedAmount != null ? `S/ ${data.claimedAmount.toFixed(2)}` : '—';
  return `<table style="border-collapse:collapse;width:100%;margin:16px 0;">
    ${row('N° de hoja', `<strong>${escapeHtml(data.complaintNumber)}</strong>`)}
    ${row('Fecha', formatDate(data.createdAt))}
    ${row('Tipo', TYPE_LABEL[data.complaintType])}
    ${row('Consumidor', escapeHtml(data.consumerName))}
    ${row('Documento', `${data.consumerDocType} ${escapeHtml(data.consumerDocNumber)}`)}
    ${row('Domicilio', escapeHtml(data.consumerAddress))}
    ${row('Email', escapeHtml(data.consumerEmail))}
    ${data.consumerPhone ? row('Teléfono', escapeHtml(data.consumerPhone)) : ''}
    ${data.isMinor && data.guardianName ? row('Apoderado', escapeHtml(data.guardianName)) : ''}
    ${row('Bien contratado', `${data.itemType} — ${escapeHtml(data.itemDescription)}`)}
    ${row('Monto reclamado', amount)}
    ${row('Detalle', escapeHtml(data.detail))}
    ${row('Pedido del consumidor', escapeHtml(data.consumerRequest))}
  </table>`;
}

function shell(title: string, inner: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#fdfcfa;padding:24px;">
    <h1 style="color:${BRAND};font-size:20px;margin:0 0 4px;">${BUSINESS.name}</h1>
    <p style="color:#666;font-size:13px;margin:0 0 16px;">Libro de Reclamaciones</p>
    <h2 style="color:#1a1a1a;font-size:16px;margin:0 0 8px;">${title}</h2>
    ${inner}
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0;" />
    <p style="color:#999;font-size:12px;line-height:1.5;">
      ${BUSINESS.razonSocial} · RUC ${BUSINESS.ruc}<br/>${BUSINESS.address}
    </p>
  </div>`;
}

/** Copia de la hoja que recibe el consumidor (requisito legal). */
export function consumerCopyEmail(data: ComplaintEmailData): EmailContent {
  const inner = `
    <p style="color:#1a1a1a;font-size:14px;line-height:1.6;">
      Hemos registrado tu ${data.complaintType === 'QUEJA' ? 'queja' : 'reclamo'}.
      Esta es la copia de tu hoja de reclamación. Conserva el número de hoja para
      cualquier seguimiento.
    </p>
    ${hojaTable(data)}
    <p style="color:${ACCENT};font-size:14px;font-weight:bold;">
      Te responderemos en un plazo máximo de ${RESPONSE_BUSINESS_DAYS} días hábiles.
    </p>`;
  return {
    subject: `Tu hoja de reclamación N° ${data.complaintNumber} — ${BUSINESS.name}`,
    html: shell('Copia de tu hoja de reclamación', inner),
  };
}

/** Aviso interno al negocio con link al panel admin. */
export function businessNotificationEmail(
  data: ComplaintEmailData,
  complaintId: string,
): EmailContent {
  const adminUrl = `${BUSINESS.website}/admin/reclamos/${complaintId}`;
  const inner = `
    <p style="color:#1a1a1a;font-size:14px;line-height:1.6;">
      Se registró una nueva ${data.complaintType === 'QUEJA' ? 'queja' : 'reclamación'}
      en el Libro de Reclamaciones.
    </p>
    ${hojaTable(data)}
    <p style="margin:16px 0;">
      <a href="${adminUrl}" style="background:${BRAND};color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px;display:inline-block;">
        Ver y responder en el panel
      </a>
    </p>
    <p style="color:#999;font-size:12px;">
      Recuerda responder dentro de los ${RESPONSE_BUSINESS_DAYS} días hábiles.
    </p>`;
  return {
    subject: `Nueva reclamación N° ${data.complaintNumber} — ${data.complaintType}`,
    html: shell('Nueva reclamación recibida', inner),
  };
}
