import SectionHeader from '@/components/ui/SectionHeader';
import type { SiteSettings } from '@/lib/siteSettings';

import ContactDetails from './ContactDetails';
import ContactMap from './ContactMap';

interface ContactSectionProps {
  settings: SiteSettings;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  return (
    <section id="contacto" className="scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[90rem] space-y-10">
        <SectionHeader
          align="left"
          title={settings.titles.contact}
          description={`Estamos en ${settings.location}. Pasa por la tienda o escríbenos y armamos tu pedido.`}
        />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch">
          <ContactDetails settings={settings} />
          <ContactMap settings={settings} />
        </div>
      </div>
    </section>
  );
}
