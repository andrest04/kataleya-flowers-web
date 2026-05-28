import EmptyState from '@/components/ui/EmptyState';
import ComplaintsTable from '@/features/complaints/components/admin/ComplaintsTable';
import { getComplaints } from '@/features/complaints/queries/complaints';

export const metadata = { title: 'Reclamos' };

export default async function AdminReclamosPage() {
  const complaints = await getComplaints();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold" style={{ color: 'var(--color-dark)' }}>
          Reclamos
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          {complaints.length} reclamo{complaints.length !== 1 ? 's' : ''} en total
        </p>
      </div>

      {complaints.length === 0 ? (
        <EmptyState message="Todavía no se registraron reclamos en el Libro de Reclamaciones." />
      ) : (
        <ComplaintsTable complaints={complaints} />
      )}
    </div>
  );
}
