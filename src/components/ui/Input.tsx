import { type Ref } from 'react';

import { Input as ShadcnInput } from '@/components/ui/primitives/input';
import { Textarea as ShadcnTextarea } from '@/components/ui/primitives/textarea';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, ref, ...props }: InputProps) {
  return (
    <ShadcnInput
      ref={ref}
      className={cn(className)}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ className, ref, ...props }: TextareaProps) {
  return (
    <ShadcnTextarea
      ref={ref}
      className={cn('resize-y', className)}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
}

const selectClasses =
  'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2 border bg-surface text-foreground border-border';

export function Select({ className = '', ref, ...props }: SelectProps) {
  return (
    <select
      ref={ref}
      className={cn(selectClasses, className)}
      {...props}
    />
  );
}
