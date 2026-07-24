import { Suspense } from 'react';

import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
import NotFoundContent from '@/components/shared/NotFoundContent';

export default function NotFound() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Navbar />
      </Suspense>
      <NotFoundContent />
      <Footer />
    </>
  );
}
