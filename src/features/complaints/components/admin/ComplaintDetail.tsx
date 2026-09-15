import type { Complaint } from '../../types';
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

export default function ComplaintDetail({ complaint: c }: { complaint: Complaint }) {
  const overdue = isResponseOverdue(c.createdAt, c.respondedAt);
  const amount = c.claimedAmount != null ? `S/ ${c.claimedAmount.toFixed(2)}` : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-heading text-2xl" style={{ color: 'var(--color-primary)' }}>
          {formatComplaintNumber(c.correlativo, c.createdAt)}
        </span>
        <ComplaintTypeBadge type={c.complaintType} />
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {formatDate(c.createdAt)}
        </span>
      </div>

      <p className="text-sm" style={{ color: overdue ? 'var(--color-primary)' : 'var(--color-accent)' }}>
        {c.respondedAt
          ? `Respondido el ${formatDate(c.respondedAt)}`
          : overdue
            ? 'Plazo de respuesta VENCIDO'
            : `Vence el ${formatDate(responseDeadline(c.createdAt).toISOString())}`}
      </p>

      <dl className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        <Row label="Consumidor" value={c.consumerName} />
        <Row label="Documento" value={`${c.consumerDocType} ${c.consumerDocNumber}`} />
        <Row label="Domicilio" value={c.consumerAddress} />
        <Row label="Email" value={c.consumerEmail} />
        <Row label="Teléfono" value={c.consumerPhone} />
        <Row label="Apoderado" value={c.isMinor ? c.guardianName : null} />
        <Row label="Bien contratado" value={`${c.itemType} — ${c.itemDescription}`} />
        <Row label="Monto reclamado" value={amount} />
        <Row label="Detalle" value={c.detail} />
        <Row label="Pedido del consumidor" value={c.consumerRequest} />
      </dl>
    </div>
  );
}
