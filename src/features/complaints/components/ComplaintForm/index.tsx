'use client';

import { useActionState, useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormField';

import { submitComplaint } from '../../actions/submitComplaint';
import type { ComplaintFormData } from '../../schemas/complaint';
import type { ComplaintType, DocType, ItemType } from '../../types';
import ConsumerFields from './ConsumerFields';
import DetailFields from './DetailFields';
import ItemFields from './ItemFields';
import SubmitState from './SubmitState';

interface FormState {
  error?: string;
  fieldErrors: Record<string, string>;
  success?: {
    complaintNumber: string;
    createdAt: string;
    emailSent: boolean;
    data: ComplaintFormData;
  };
}

const INITIAL: FormState = { fieldErrors: {} };

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-(--color-border) pt-8 first:border-t-0 first:pt-0">
      <legend className="w-full pb-2">
        <span className="block font-body text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          Paso {n}
        </span>
        <span className="mt-1 block font-heading text-2xl text-primary">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

export default function ComplaintForm() {
  const [complaintType, setComplaintType] = useState<ComplaintType>('RECLAMO');
  const [isMinor, setIsMinor] = useState(false);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const amount = (formData.get('claimedAmount') as string)?.trim();
      const data: ComplaintFormData = {
        consumerName: String(formData.get('consumerName') ?? ''),
        consumerDocType: (formData.get('consumerDocType') as DocType) ?? 'DNI',
        consumerDocNumber: String(formData.get('consumerDocNumber') ?? ''),
        consumerAddress: String(formData.get('consumerAddress') ?? ''),
        consumerPhone: String(formData.get('consumerPhone') ?? ''),
        consumerEmail: String(formData.get('consumerEmail') ?? ''),
        isMinor,
        guardianName: String(formData.get('guardianName') ?? ''),
        itemType: (formData.get('itemType') as ItemType) ?? 'PRODUCTO',
        itemDescription: String(formData.get('itemDescription') ?? ''),
        claimedAmount: amount ? Number(amount) : undefined,
        complaintType,
        detail: String(formData.get('detail') ?? ''),
        consumerRequest: String(formData.get('consumerRequest') ?? ''),
      };

      const result = await submitComplaint(data);

      if (result.success) {
        return {
          fieldErrors: {},
          success: {
            complaintNumber: result.complaintNumber,
            createdAt: result.createdAt,
            emailSent: result.emailSent,
            data,
          },
        };
      }

      const fieldErrors: Record<string, string> = {};
      for (const issue of result.issues ?? []) {
        const key = issue.path[0];
        if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { error: result.error, fieldErrors };
    },
    INITIAL,
  );

  if (state.success) {
    return <SubmitState {...state.success} />;
  }

  return (
    <form action={formAction} className="space-y-10" aria-busy={isPending} noValidate>
      <FormError message={state.error} />
      <Section n={1} title="Datos del consumidor">
        <ConsumerFields errors={state.fieldErrors} isMinor={isMinor} onMinorChange={setIsMinor} />
      </Section>
      <Section n={2} title="Identificación del bien contratado">
        <ItemFields errors={state.fieldErrors} />
      </Section>
      <Section n={3} title="Detalle del reclamo o queja">
        <DetailFields errors={state.fieldErrors} value={complaintType} onChange={setComplaintType} />
      </Section>
      <Button type="submit" variant="primary" size="lg" loading={isPending} fullWidth>
        {isPending ? 'Enviando…' : 'Enviar reclamación'}
      </Button>
    </form>
  );
}
