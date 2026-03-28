'use client';
// TODO: Error boundary para el catálogo
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Error(_props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return null;
}
