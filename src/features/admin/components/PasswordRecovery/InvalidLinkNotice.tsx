import AuthLink from './AuthLink';

export default function InvalidLinkNotice() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-medium" style={{ color: 'var(--color-dark)' }}>
        Enlace no válido
      </h2>
      <p className="text-sm" style={{ color: 'var(--color-dark)' }}>
        El enlace está incompleto o ya venció. Solicita uno nuevo para restablecer tu contraseña.
      </p>
      <AuthLink href="/recuperar-contrasena">Solicitar un enlace nuevo</AuthLink>
    </div>
  );
}
