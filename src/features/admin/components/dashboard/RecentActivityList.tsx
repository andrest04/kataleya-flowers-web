interface ActivityItem {
  name: string;
  type: 'product' | 'category';
  action: 'created' | 'updated';
  date: string;
}

interface Props {
  data: ActivityItem[];
}

function getRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem.`;
  return `hace ${Math.floor(diffDays / 30)} mes.`;
}

export default function RecentActivityList({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        Sin actividad reciente.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((item, index) => (
        <li
          key={index}
          className="flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}
        >
          <span
            className="shrink-0 h-2 w-2 rounded-full"
            style={{
              backgroundColor: item.action === 'created' ? 'var(--color-status-created)' : 'var(--color-status-updated)',
            }}
          />
          <span
            className="flex-1 text-sm font-semibold truncate"
            style={{ color: 'var(--color-dark)' }}
          >
            {item.name}
          </span>
          <span
            className="text-xs shrink-0"
            style={{ color: 'var(--color-muted)' }}
          >
            {item.type === 'product' ? 'Producto' : 'Categoría'}
          </span>
          <span
            className="text-xs shrink-0"
            style={{ color: 'var(--color-muted)' }}
          >
            {getRelativeDate(item.date)}
          </span>
        </li>
      ))}
    </ul>
  );
}
