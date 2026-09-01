import Link from 'next/link';
import { notFound } from 'next/navigation';

import DiscoverTileEditor from '@/features/admin/components/DiscoverTileEditor';
import { draftFromDiscoverTile } from '@/features/admin/components/DiscoverTileEditor/mapDraft';
import { getAdminDiscoverTileById, getAdminDiscoverTiles } from '@/features/admin/queries/discoverTiles';
import { HOME_DISCOVER_TILE_LIMIT } from '@/lib/discoverTileLimit';

interface EditarTarjetaPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditarTarjetaPageProps) {
  const { id } = await params;
  const tile = await getAdminDiscoverTileById(id);
  return { title: tile ? `Editar ${tile.title}` : 'Editar tarjeta' };
}

export default async function EditarTarjetaPage({ params }: EditarTarjetaPageProps) {
  const { id } = await params;
  const [tile, tiles] = await Promise.all([
    getAdminDiscoverTileById(id),
    getAdminDiscoverTiles(),
  ]);
  if (!tile) notFound();
  const activeCount = tiles.filter((item) => item.is_active).length;
  const allowActivate = tile.is_active || activeCount < HOME_DISCOVER_TILE_LIMIT;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inicio"
        className="text-sm text-(--color-muted) transition-opacity hover:opacity-70"
      >
        ← Volver a inicio
      </Link>
      <div>
        <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">Editar tarjeta</h1>
      </div>
      <DiscoverTileEditor
        allowActivate={allowActivate}
        allowHide
        initial={draftFromDiscoverTile(tile)}
        tileId={tile.id}
      />
    </div>
  );
}
