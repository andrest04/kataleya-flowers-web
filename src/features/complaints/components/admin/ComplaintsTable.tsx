import Link from 'next/link';

import type { ComplaintRow } from '../../types';
import {
  formatComplaintNumber,
  isResponseOverdue,
  responseDeadline,
} from '../../utils/format';
import ComplaintTypeBadge from '../ComplaintTypeBadge';
import StatusPill from '../StatusPill';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function ComplaintsTable({ complaints }: { complaints: ComplaintRow[] }) {
  return (
    <div
      className="overflow-x-auto rounded-xl border"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-white)' }}
    >
      <table className="w-full text-left text-sm">
        <thead style={{ color: 'var(--color-muted)' }}>
          <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
            <th className="px-4 py-3 font-medium">N°</th>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Consumidor</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Plazo</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => {
            const overdue = isResponseOverdue(c.created_at, c.responded_at);
            return (
              <tr
                key={c.id}
                className="border-b transition-colors hover:bg-(--color-surface)"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/reclamos/${c.id}`}
                    className="font-medium underline-offset-2 hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {formatComplaintNumber(c.correlativo, c.created_at)}
                  </Link>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--color-dark)' }}>
                  {formatDate(c.created_at)}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--color-dark)' }}>
                  {c.consumer_name}
                </td>
                <td className="px-4 py-3">
                  <ComplaintTypeBadge type={c.complaint_type} />
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={c.status} />
                </td>
                <td
                  className="px-4 py-3"
                  style={{ color: overdue ? 'var(--color-primary)' : 'var(--color-muted)' }}
                >
                  {overdue ? 'Vencido' : formatDate(responseDeadline(c.created_at).toISOString())}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
