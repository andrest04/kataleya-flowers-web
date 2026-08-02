import Link from 'next/link';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/primitives/table';

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
    <div className="space-y-3">
      <div
        className="hidden overflow-x-auto rounded-xl border md:block"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-white)' }}
      >
        <Table>
          <TableHeader style={{ color: 'var(--color-muted)' }}>
            <TableRow className="border-b" style={{ borderColor: 'var(--color-border)' }}>
              <TableHead>N°</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Consumidor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Plazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((c) => {
              const overdue = isResponseOverdue(c.created_at, c.responded_at);
              return (
                <TableRow
                  key={c.id}
                  className="border-b transition-colors hover:bg-(--color-surface)"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <TableCell>
                    <Link
                      href={`/admin/reclamos/${c.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {formatComplaintNumber(c.correlativo, c.created_at)}
                    </Link>
                  </TableCell>
                  <TableCell style={{ color: 'var(--color-dark)' }}>
                    {formatDate(c.created_at)}
                  </TableCell>
                  <TableCell style={{ color: 'var(--color-dark)' }}>
                    {c.consumer_name}
                  </TableCell>
                  <TableCell>
                    <ComplaintTypeBadge type={c.complaint_type} />
                  </TableCell>
                  <TableCell>
                    <StatusPill status={c.status} />
                  </TableCell>
                  <TableCell style={{ color: overdue ? 'var(--color-primary)' : 'var(--color-muted)' }}>
                    {overdue ? 'Vencido' : formatDate(responseDeadline(c.created_at).toISOString())}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {complaints.map((c) => {
          const overdue = isResponseOverdue(c.created_at, c.responded_at);
          return (
            <article
              key={c.id}
              className="rounded-xl p-4"
              style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
            >
              <Link
                href={`/admin/reclamos/${c.id}`}
                className="flex min-h-10 items-center font-medium underline-offset-2 hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                {formatComplaintNumber(c.correlativo, c.created_at)}
              </Link>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-dark)' }}>
                {c.consumer_name}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {formatDate(c.created_at)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ComplaintTypeBadge type={c.complaint_type} />
                <StatusPill status={c.status} />
              </div>
              <p
                className="mt-2 text-xs"
                style={{ color: overdue ? 'var(--color-primary)' : 'var(--color-muted)' }}
              >
                {overdue ? 'Vencido' : `Plazo: ${formatDate(responseDeadline(c.created_at).toISOString())}`}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
