import React from 'react';
import Link from 'next/link';
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbList,
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/primitives/breadcrumb';

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItemType[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <ShadcnBreadcrumb className="mb-6">
      <BreadcrumbList className="font-body">
        {items.map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <BreadcrumbSeparator />}
            <ShadcnBreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </ShadcnBreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
}
