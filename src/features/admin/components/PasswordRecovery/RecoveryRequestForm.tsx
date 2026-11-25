'use client';

import { useEffect, useRef, useState } from 'react';

import { FormError } from '@/components/ui/FormField';
import { requestPasswordRecoveryAction } from '@/features/admin/actions/auth';

import AuthLink from './AuthLink';
import RecoveryField from './RecoveryField';
import SubmitButton from './SubmitButton';
import { useFocusFirstInvalid } from './useFocusFirstInvalid';

const GENERIC_ERROR = 'No se pudo procesar la solicitud. Intenta de nuevo.';

interface FormState {
  attempt: number;
  error: string | null;
  emailError?: string;
}

const INITIAL_STATE: FormState = { attempt: 0, error: null };

export default function RecoveryRequestForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useFocusFirstInvalid<HTMLFormElement>(state.attempt);
  const confirmationRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) confirmationRef.current?.focus();
  }, [sent]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const result = await requestPasswordRecoveryAction({ email });
      if (result.ok) {
        setSent(true);
        return;
      }
      setState((previous) => ({
        attempt: previous.attempt + 1,
        error: result.code === 'VALIDATION' ? 'Revisa el campo marcado.' : result.error,
        emailError: result.code === 'VALIDATION' ? result.fieldErrors.email : undefined,
      }));
    } catch {
      setState((previous) => ({ attempt: previous.attempt + 1, error: GENERIC_ERROR }));
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <h2
          ref={confirmationRef}
          tabIndex={-1}
          className="text-lg font-medium outline-none"
          style={{ color: 'var(--color-dark)' }}
        >
          Revisa tu correo
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-dark)' }}>
          Si tu correo está registrado, te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <AuthLink href="/login">Volver a iniciar sesión</AuthLink>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
      aria-busy={pending}
      className="space-y-5"
    >
      <FormError message={state.error} />
      <RecoveryField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        error={state.emailError}
      />
      <SubmitButton pending={pending} label="Enviar enlace" pendingLabel="Enviando…" />
      <p className="text-center">
        <AuthLink href="/login">Volver a iniciar sesión</AuthLink>
      </p>
    </form>
  );
}
