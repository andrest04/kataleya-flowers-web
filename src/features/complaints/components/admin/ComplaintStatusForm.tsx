'use client';

import { useRouter } from 'next/navigation';
import { useActionState } from 'react';

import Button from '@/components/ui/Button';
import { FormError, FormField } from '@/components/ui/FormField';
import { Select, Textarea } from '@/components/ui/Input';

import { updateComplaint } from '../../actions/updateComplaint';
import { COMPLAINT_STATUSES } from '../../schemas/complaint';

interface ComplaintStatusFormProps {
  id: string;
  status: string;
  providerResponse: string | null;
}

interface FormState {
  error?: string;
  ok?: boolean;
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
    async (_prev, formData) => {
      const result = await updateComplaint({
        id,
        status: formData.get('status'),
        providerResponse: formData.get('providerResponse') ?? '',
      });
      if (!result.success) return { error: result.error };
      router.refresh();
      return { ok: true };
    },
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      {state.ok && (
        <p className="text-sm" style={{ color: 'var(--color-accent)' }}>
          Cambios guardados.
        </p>
      )}

      <FormField label="Estado" htmlFor="status">
        <Select id="status" name="status" defaultValue={status}>
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
          defaultValue={providerResponse ?? ''}
          placeholder="Detalle la respuesta enviada al consumidor."
        />
      </FormField>

      <Button type="submit" variant="primary" size="md" loading={isPending}>
        {isPending ? 'Guardando…' : 'Guardar respuesta'}
      </Button>
    </form>
  );
}
