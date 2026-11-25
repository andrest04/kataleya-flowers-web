import Link from 'next/link';

interface AuthLinkProps {
  href: '/login' | '/recuperar-contrasena';
  children: React.ReactNode;
}

export default function AuthLink({ href, children }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className="text-sm font-medium underline underline-offset-4"
      style={{ color: 'var(--color-primary)' }}
    >
      {children}
    </Link>
  );
}
