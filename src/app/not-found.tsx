import { Suspense } from 'react';

import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
import NotFoundContent from '@/components/shared/NotFoundContent';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';

export default async function NotFound() {
  const settings = await getSiteSettings();

  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Navbar settings={settings} />
      </Suspense>
      <NotFoundContent />
      <Footer settings={settings} />
    </>
  );
}
