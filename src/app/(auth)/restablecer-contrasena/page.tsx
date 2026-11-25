import type { Metadata } from 'next';

import AuthShell from '@/features/admin/components/PasswordRecovery/AuthShell';
import InvalidLinkNotice from '@/features/admin/components/PasswordRecovery/InvalidLinkNotice';
import ResetPasswordForm from '@/features/admin/components/PasswordRecovery/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
};

interface ResetPasswordPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function singleValue(value: string | string[] | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const userId = singleValue(params.userId);
  const secret = singleValue(params.secret);

  return (
    <AuthShell
      title="Restablecer contraseña"
      description={userId && secret ? 'Crea una contraseña nueva para tu cuenta.' : undefined}
    >
      {userId && secret ? (
        <ResetPasswordForm userId={userId} secret={secret} />
      ) : (
        <InvalidLinkNotice />
      )}
    </AuthShell>
  );
}
