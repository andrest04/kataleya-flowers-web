'use client';

import AnnouncementFields from './AnnouncementFields';
import ContactFields from './ContactFields';
import type { FieldErrors } from './formErrors';
import HoursFields from './HoursFields';
import IdentityFields from './IdentityFields';
import LegalFields from './LegalFields';
import TitleFields from './TitleFields';
import type { SiteSettingsDraft } from './types';
import WhatsappMessageFields from './WhatsappMessageFields';

interface SiteSettingsFieldsProps {
  draft: SiteSettingsDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<SiteSettingsDraft>) => void;
}

export default function SiteSettingsFields({ draft, errors, onChange }: SiteSettingsFieldsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <IdentityFields draft={draft} errors={errors} onChange={onChange} />
      <ContactFields draft={draft} errors={errors} onChange={onChange} />
      <HoursFields draft={draft} errors={errors} onChange={onChange} />
      <LegalFields draft={draft} errors={errors} onChange={onChange} />
      <WhatsappMessageFields draft={draft} errors={errors} onChange={onChange} />
      <AnnouncementFields draft={draft} errors={errors} onChange={onChange} />
      <TitleFields draft={draft} errors={errors} onChange={onChange} />
    </div>
  );
}
