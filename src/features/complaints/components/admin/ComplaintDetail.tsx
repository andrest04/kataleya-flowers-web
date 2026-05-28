import type { ComplaintRow } from '../../types';
import {
  formatComplaintNumber,
  isResponseOverdue,
  responseDeadline,
} from '../../utils/format';
import ComplaintTypeBadge from '../ComplaintTypeBadge';

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="py-2">
      <dt className="text-xs" style={{ color: 'var(--color-muted)' }}>
        {label}
      </dt>
      <dd className="text-sm" style={{ color: 'var(--color-dark)' }}>
        {value}
      </dd>
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function ComplaintDetail({ complaint: c }: { complaint: ComplaintRow }) {
  const overdue = isResponseOverdue(c.created_at, c.responded_at);
  const amount = c.claimed_amount != null ? `S/ ${c.claimed_amount.toFixed(2)}` : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-heading text-2xl" style={{ color: 'var(--color-primary)' }}>
          {formatComplaintNumber(c.correlativo, c.created_at)}
        </span>
        <ComplaintTypeBadge type={c.complaint_type} />
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {formatDate(c.created_at)}
        </span>
      </div>

      <p className="text-sm" style={{ color: overdue ? 'var(--color-primary)' : 'var(--color-accent)' }}>
        {c.responded_at
          ? `Respondido el ${formatDate(c.responded_at)}`
          : overdue
            ? 'Plazo de respuesta VENCIDO'
            : `Vence el ${formatDate(responseDeadline(c.created_at).toISOString())}`}
      </p>

      <dl className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        <Row label="Consumidor" value={c.consumer_name} />
        <Row label="Documento" value={`${c.consumer_doc_type} ${c.consumer_doc_number}`} />
        <Row label="Domicilio" value={c.consumer_address} />
        <Row label="Email" value={c.consumer_email} />
        <Row label="Teléfono" value={c.consumer_phone} />
        <Row label="Apoderado" value={c.is_minor ? c.guardian_name : null} />
        <Row label="Bien contratado" value={`${c.item_type} — ${c.item_description}`} />
        <Row label="Monto reclamado" value={amount} />
        <Row label="Detalle" value={c.detail} />
        <Row label="Pedido del consumidor" value={c.consumer_request} />
      </dl>
    </div>
  );
}
