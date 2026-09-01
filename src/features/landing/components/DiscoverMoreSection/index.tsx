import SectionHeader from '@/components/ui/SectionHeader';
import { getPublishedDiscoverTiles } from '@/features/landing/queries/getPublishedDiscoverTiles';

import EditorialTile from './EditorialTile';
import { discoverIcon } from './icons';

interface DiscoverMoreSectionProps {
  title: string;
}

export default async function DiscoverMoreSection({ title }: DiscoverMoreSectionProps) {
  const tiles = await getPublishedDiscoverTiles();
  if (tiles.length === 0) return null;

  return (
    <section id="nosotros" className="scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[90rem] space-y-10">
        <SectionHeader align="left" title={title} />
        <div className="flex flex-col gap-x-8 gap-y-10 md:flex-row md:flex-wrap md:justify-center md:gap-10">
          {tiles.map((tile) => (
            <div key={tile.id} className="w-full md:w-[calc((100%-5rem)/3)]">
              <EditorialTile
                description={tile.description}
                external={tile.external}
                href={tile.href}
                Icon={discoverIcon(tile.icon)}
                imageSrc={tile.imageSrc}
                title={tile.title}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
