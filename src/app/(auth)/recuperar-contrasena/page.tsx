import type { Metadata } from 'next';

import AuthShell from '@/features/admin/components/PasswordRecovery/AuthShell';
import RecoveryRequestForm from '@/features/admin/components/PasswordRecovery/RecoveryRequestForm';

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
};

export default function RecoverPasswordPage() {
  return (
    <AuthShell
      title="Recuperar contraseña"
      description="Escribe el email de tu cuenta de administrador para recibir un enlace de restablecimiento."
    >
      <RecoveryRequestForm />
    </AuthShell>
  );
}
