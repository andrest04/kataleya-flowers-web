import { BUSINESS } from '@/lib/constants';

interface AuthShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--color-cream)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-serif text-lg" style={{ color: 'var(--color-primary)' }}>
            {BUSINESS.name}
          </p>
          <h1 className="font-serif text-3xl mt-1" style={{ color: 'var(--color-primary)' }}>
            {title}
          </h1>
          {description && (
            <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
              {description}
            </p>
          )}
        </div>

        <div
          className="p-8 rounded-2xl"
          style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
