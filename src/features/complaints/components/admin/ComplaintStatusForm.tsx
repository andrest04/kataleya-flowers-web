'use client';

import { useRouter } from 'next/navigation';
import { useActionState } from 'react';

import Button from '@/components/ui/Button';
import { FormError, FormField } from '@/components/ui/FormField';
import { Select, Textarea } from '@/components/ui/Input';

import { updateComplaint } from '../../actions/updateComplaint';
import { COMPLAINT_STATUSES } from '../../schemas/constants';

interface ComplaintStatusFormProps {
  id: string;
  status: string;
  providerResponse: string | null;
}

interface FormValues {
  status: string;
  providerResponse: string;
}

interface FormState {
  attempt: number;
  error?: string;
  ok?: boolean;
  values?: FormValues;
}

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESPONDIDO: 'Respondido',
};

export default function ComplaintStatusForm({
  id,
  status,
  providerResponse,
}: ComplaintStatusFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (prev, formData) => {
      const values: FormValues = {
        status: String(formData.get('status') ?? ''),
        providerResponse: String(formData.get('providerResponse') ?? ''),
      };
      const result = await updateComplaint({ id, ...values });
      if (!result.success) return { attempt: prev.attempt + 1, error: result.error, values };
      router.refresh();
      return { attempt: prev.attempt + 1, ok: true, values };
    },
    { attempt: 0 },
  );
  const values = state.values ?? { status, providerResponse: providerResponse ?? '' };

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      {state.ok && (
        <p className="text-sm" style={{ color: 'var(--color-accent)' }}>
          Cambios guardados.
        </p>
      )}

      <FormField label="Estado" htmlFor="status">
        <Select key={state.attempt} id="status" name="status" defaultValue={values.status}>
          {COMPLAINT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Respuesta del proveedor" htmlFor="providerResponse">
        <Textarea
          id="providerResponse"
          name="providerResponse"
          rows={5}
          key={state.attempt}
          defaultValue={values.providerResponse}
          placeholder="Detalla la respuesta enviada al consumidor."
        />
      </FormField>

      <Button type="submit" variant="primary" size="md" loading={isPending}>
        {isPending ? 'Guardando…' : 'Guardar respuesta'}
      </Button>
    </form>
  );
}
