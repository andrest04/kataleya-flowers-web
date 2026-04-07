interface SectionHeaderProps {
  subtitle: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}

export default function SectionHeader({
  subtitle,
  title,
  description,
  align = 'center',
}: SectionHeaderProps) {
  const textAlign = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`space-y-4 ${textAlign}`}>
      <p className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">
        {subtitle}
      </p>
      <div className="space-y-3">
        <h2 className="text-4xl sm:text-5xl font-heading text-primary">
          {title}
        </h2>
        {description && (
          <p className={`text-lg leading-8 ${align === 'center' ? 'mx-auto max-w-2xl' : ''}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
