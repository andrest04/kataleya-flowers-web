'use client';

import { useActionState, useEffect, useRef, useState } from 'react';

import Button from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormField';

import { submitComplaint } from '../../actions/submitComplaint';
import type { ComplaintProvider } from '../../email/templates';
import type { ComplaintFormData } from '../../schemas/complaint';
import type { ComplaintType } from '../../types';
import ConsumerFields from './ConsumerFields';
import DetailFields from './DetailFields';
import { errorSummary, fieldErrorsFromIssues, formDataToComplaint } from './formData';
import ItemFields from './ItemFields';
import SubmitState from './SubmitState';

interface FormState {
  attempt: number;
  error?: string;
  fieldErrors: Record<string, string>;
  values?: ComplaintFormData;
  success?: {
    complaintNumber: string;
    createdAt: string;
    emailSent: boolean;
    data: ComplaintFormData;
  };
}

const INITIAL: FormState = { attempt: 0, fieldErrors: {} };

const TOTAL_STEPS = 3;

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5 [&>legend]:mb-0 border-t border-(--color-border) pt-8 first:border-t-0 first:pt-0">
      <legend className="w-full pb-4">
        <span className="block font-body text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          Paso {n} de {TOTAL_STEPS}
        </span>
        <h2 className="mt-1 font-heading text-2xl text-primary">{title}</h2>
      </legend>
      {children}
    </fieldset>
  );
}

export default function ComplaintForm({ provider }: { provider: ComplaintProvider }) {
  const [complaintType, setComplaintType] = useState<ComplaintType>('RECLAMO');
  const [isMinor, setIsMinor] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (prev, formData) => {
      const data = formDataToComplaint(formData, { isMinor, complaintType });
      const result = await submitComplaint(data);

      if (result.success) {
        return {
          attempt: prev.attempt + 1,
          fieldErrors: {},
          success: {
            complaintNumber: result.complaintNumber,
            createdAt: result.createdAt,
            emailSent: result.emailSent,
            data,
          },
        };
      }

      const fieldErrors = fieldErrorsFromIssues(result.issues);
      return {
        attempt: prev.attempt + 1,
        error: errorSummary(fieldErrors, result.error),
        fieldErrors,
        values: data,
      };
    },
    INITIAL,
  );

  useEffect(() => {
    if (!state.error) return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!firstInvalid) return;
    firstInvalid.focus({ preventScroll: true });
    firstInvalid.scrollIntoView({ block: 'center' });
  }, [state]);

  if (state.success) {
    return <SubmitState {...state.success} provider={provider} />;
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-10" aria-busy={isPending} noValidate>
      <FormError message={state.error} />
      <p className="text-sm text-(--color-muted)">
        <span className="text-primary" aria-hidden="true">
          *
        </span>{' '}
        Campo obligatorio
      </p>
      <Section n={1} title="Datos del consumidor">
        <ConsumerFields
          key={state.attempt}
          errors={state.fieldErrors}
          values={state.values}
          isMinor={isMinor}
          onMinorChange={setIsMinor}
        />
      </Section>
      <Section n={2} title="Identificación del bien contratado">
        <ItemFields
          key={state.attempt}
          errors={state.fieldErrors}
          values={state.values}
          complaintType={complaintType}
        />
      </Section>
      <Section n={3} title="Detalle del reclamo o queja">
        <DetailFields
          key={state.attempt}
          errors={state.fieldErrors}
          values={state.values}
          value={complaintType}
          onChange={setComplaintType}
        />
      </Section>
      <Button type="submit" variant="primary" size="lg" loading={isPending} fullWidth>
        {isPending ? 'Enviando…' : 'Enviar reclamación'}
      </Button>
    </form>
  );
}
