interface SectionHeaderProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  as?: 'h1' | 'h2';
}

export default function SectionHeader({
  subtitle,
  title,
  description,
  align = 'center',
  as: Heading = 'h2',
}: SectionHeaderProps) {
  const textAlign = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`space-y-4 ${textAlign}`}>
      {subtitle && (
        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">
          {subtitle}
        </p>
      )}
      <div className="space-y-3">
        <Heading className="text-4xl sm:text-5xl font-heading text-primary">
          {title}
        </Heading>
        {description && (
          <p className={`text-lg leading-8 ${align === 'center' ? 'mx-auto max-w-2xl' : ''}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
