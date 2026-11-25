'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { FormError } from '@/components/ui/FormField';
import type { ResetPasswordField, ResetPasswordResult } from '@/features/admin/actions/auth';
import { resetPasswordAction } from '@/features/admin/actions/auth';

import AuthLink from './AuthLink';
import PasswordCriteriaList from './PasswordCriteriaList';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import RecoveryField from './RecoveryField';
import SubmitButton from './SubmitButton';
import { useFocusFirstInvalid } from './useFocusFirstInvalid';
import { usePasswordRequirements } from './usePasswordRequirements';

type FieldErrors = Partial<Record<ResetPasswordField, string>>;

interface FormState {
  attempt: number;
  error: string | null;
  fieldErrors: FieldErrors;
  invalidLink: boolean;
}

const INITIAL_STATE: FormState = { attempt: 0, error: null, fieldErrors: {}, invalidLink: false };

const GENERIC_ERROR = 'No se pudo cambiar la contraseña. Intenta de nuevo.';
const FIELD_SUMMARY = 'Revisa el campo marcado.';
const CRITERIA_ID = 'password-criteria';
const STRENGTH_ID = 'password-strength';

function failureState(result: Exclude<ResetPasswordResult, { ok: true }>) {
  if (result.code === 'VALIDATION') {
    const count = Object.keys(result.fieldErrors).length;
    return {
      error: count > 1 ? `Revisa los ${count} campos marcados.` : FIELD_SUMMARY,
      fieldErrors: result.fieldErrors,
      invalidLink: false,
    };
  }
  if (result.code === 'WEAK_PASSWORD') {
    return { error: FIELD_SUMMARY, fieldErrors: { password: result.error }, invalidLink: false };
  }
  return { error: result.error, fieldErrors: {}, invalidLink: result.code === 'INVALID_LINK' };
}

interface ResetPasswordFormProps {
  userId: string;
  secret: string;
}

export default function ResetPasswordForm({ userId, secret }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [pending, setPending] = useState(false);
  const formRef = useFocusFirstInvalid<HTMLFormElement>(state.attempt);
  const { criteria, strength, hardToGuess, passwordsMatch, canSubmit } = usePasswordRequirements(
    password,
    confirmPassword,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setPending(true);

    try {
      const result = await resetPasswordAction({ userId, secret, password, confirmPassword });
      if (result.ok) {
        router.replace('/login?reset=ok');
        return;
      }
      setState((previous) => ({ attempt: previous.attempt + 1, ...failureState(result) }));
    } catch {
      setState((previous) => ({
        attempt: previous.attempt + 1,
        error: GENERIC_ERROR,
        fieldErrors: {},
        invalidLink: false,
      }));
    }
    setPending(false);
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
      {state.invalidLink && (
        <p className="text-center">
          <AuthLink href="/recuperar-contrasena">Solicitar un enlace nuevo</AuthLink>
        </p>
      )}
      <RecoveryField
        id="password"
        label="Contraseña nueva"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        error={state.fieldErrors.password}
        describedBy={`${CRITERIA_ID} ${STRENGTH_ID}`}
      />
      <div className="-mt-3">
        <PasswordStrengthMeter id={STRENGTH_ID} strength={strength} />
        <PasswordCriteriaList
          id={CRITERIA_ID}
          criteria={criteria}
          hardToGuess={hardToGuess}
          passwordsMatch={passwordsMatch}
        />
      </div>
      <RecoveryField
        id="confirmPassword"
        label="Repite la contraseña"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={state.fieldErrors.confirmPassword}
      />
      <SubmitButton
        pending={pending}
        disabled={!canSubmit}
        describedBy={CRITERIA_ID}
        label="Cambiar contraseña"
        pendingLabel="Cambiando…"
      />
    </form>
  );
}
