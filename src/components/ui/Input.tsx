import { type Ref } from 'react';

const inputClasses = 'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2';

const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  color: 'var(--color-dark)',
  border: '1px solid var(--color-border)',
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className = '', style, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={`${inputClasses} ${className}`}
      style={{ ...inputStyle, ...style }}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ className = '', style, ref, ...props }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      className={`${inputClasses} resize-y ${className}`}
      style={{ ...inputStyle, ...style }}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
}

export function Select({ className = '', style, ref, ...props }: SelectProps) {
  return (
    <select
      ref={ref}
      className={`${inputClasses} ${className}`}
      style={{ ...inputStyle, ...style }}
      {...props}
    />
  );
}
