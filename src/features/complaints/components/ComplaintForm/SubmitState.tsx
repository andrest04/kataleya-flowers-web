'use client';

import { CheckCircle2, Printer } from 'lucide-react';

import Button from '@/components/ui/Button';

import { consumerCopyEmail } from '../../email/templates';
import type { ComplaintFormData } from '../../schemas/complaint';
import { RESPONSE_BUSINESS_DAYS } from '../../utils/format';

interface SubmitStateProps {
  complaintNumber: string;
  createdAt: string;
  emailSent: boolean;
  data: ComplaintFormData;
}

export default function SubmitState({
  complaintNumber,
  createdAt,
  emailSent,
  data,
}: SubmitStateProps) {
  function handlePrint() {
    const { html } = consumerCopyEmail({ ...data, complaintNumber, createdAt });
    const win = window.open('', '_blank', 'width=820,height=640');
    if (!win) return;
    win.document.write(
      `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Hoja de Reclamación ${complaintNumber}</title></head><body onload="window.print()">${html}</body></html>`,
    );
    win.document.close();
  }

  return (
    <div
      className="rounded-2xl border p-8 text-center"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-white)' }}
    >
      <CheckCircle2
        className="mx-auto mb-4"
        size={48}
        style={{ color: 'var(--color-accent)' }}
        aria-hidden="true"
      />
      <h2 className="font-heading text-2xl text-primary">
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
    </div>
  );
}
