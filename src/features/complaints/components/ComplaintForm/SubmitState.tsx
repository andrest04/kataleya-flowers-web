'use client';

import { CheckCircle2, Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import Button from '@/components/ui/Button';

import {
  type ComplaintProvider,
  consumerCopyEmail,
} from '../../email/templates';
import type { ComplaintFormData } from '../../schemas/complaint';
import { RESPONSE_BUSINESS_DAYS } from '../../utils/format';
import { printDocument } from './printDocument';

interface SubmitStateProps {
  complaintNumber: string;
  createdAt: string;
  emailSent: boolean;
  data: ComplaintFormData;
  provider: ComplaintProvider;
}

export default function SubmitState({
  complaintNumber,
  createdAt,
  emailSent,
  data,
  provider,
}: SubmitStateProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [printJob, setPrintJob] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printFailed, setPrintFailed] = useState(false);
  const printHtml = printDocument(
    consumerCopyEmail({ ...data, complaintNumber, createdAt }, provider).html,
    complaintNumber,
  );

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  function handlePrint() {
    setPrintFailed(false);
    setPrintJob((job) => job + 1);
    setIsPrinting(true);
  }

  function handlePrintFrameLoad(event: React.SyntheticEvent<HTMLIFrameElement>) {
    const frameWindow = event.currentTarget.contentWindow;
    try {
      if (!frameWindow) throw new Error('Print frame unavailable');
      frameWindow.addEventListener('afterprint', () => setIsPrinting(false), { once: true });
      frameWindow.print();
    } catch {
      setIsPrinting(false);
      setPrintFailed(true);
    }
  }

  return (
    <div className="mx-auto max-w-xl border-t border-(--color-primary) pt-10 text-center">
      <CheckCircle2
        className="mx-auto mb-4"
        size={56}
        strokeWidth={1}
        style={{ color: 'var(--color-accent)' }}
        aria-hidden="true"
      />
      <h2 ref={headingRef} tabIndex={-1} className="font-heading text-2xl text-primary">
        Tu reclamación fue registrada
      </h2>
      <p className="mt-2 text-sm text-(--color-dark)">Número de hoja</p>
      <p className="font-heading text-4xl my-1" style={{ color: 'var(--color-primary)' }}>
        {complaintNumber}
      </p>
      <p className="mt-4 text-sm text-(--color-dark)">
        Te responderemos en un plazo máximo de {RESPONSE_BUSINESS_DAYS} días hábiles.
      </p>
      <p
        className="mt-3 text-sm"
        style={{ color: emailSent ? 'var(--color-accent)' : 'var(--color-primary)' }}
      >
        {emailSent
          ? '✓ Te enviamos una copia a tu correo.'
          : '⚠ No pudimos enviar el correo. Descarga o imprime tu copia y guarda este número.'}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button type="button" variant="primary" size="md" onClick={handlePrint}>
          <Printer size={16} aria-hidden="true" />
          Imprimir / descargar copia
        </Button>
        <Button href="/" variant="secondary" size="md">
          Volver al inicio
        </Button>
      </div>
      {printFailed && (
        <p role="alert" className="mt-4 text-sm" style={{ color: 'var(--color-primary)' }}>
          No pudimos abrir la impresión. Anota tu número de hoja y vuelve a intentarlo.
        </p>
      )}
      {isPrinting && (
        <iframe
          key={printJob}
          title={`Hoja de Reclamación ${complaintNumber} para imprimir`}
          sandbox="allow-modals allow-same-origin"
          srcDoc={printHtml}
          onLoad={handlePrintFrameLoad}
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none fixed top-0 -left-[10000px] h-[640px] w-[820px] border-0"
        />
      )}
    </div>
  );
}
