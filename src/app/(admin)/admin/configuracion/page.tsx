import SiteSettingsForm from '@/features/admin/components/SiteSettingsForm';
import { draftFromSettings } from '@/features/admin/components/SiteSettingsForm/mapDraft';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';

export const metadata = { title: 'Configuración' };

export default async function AdminConfiguracionPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">Configuración</h1>
      </div>
      <SiteSettingsForm initial={draftFromSettings(settings)} />
    </div>
  );
}
