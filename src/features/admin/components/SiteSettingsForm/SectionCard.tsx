import { type ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/primitives/card';

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  description?: string;
  headingId: string;
  title: string;
}

export default function SectionCard({
  children,
  className,
  description,
  headingId,
  title,
}: SectionCardProps) {
  return (
    <section className={className} aria-labelledby={headingId}>
      <Card className="h-full bg-(--color-white) [--card-spacing:--spacing(6)]">
        <CardHeader>
          <h2
            id={headingId}
            className="text-balance font-serif text-xl text-(--color-dark)"
          >
            {title}
          </h2>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
    </section>
  );
}
