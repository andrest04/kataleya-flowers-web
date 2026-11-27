export default function FieldHint({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} className="text-sm text-pretty text-(--color-muted)">
      {children}
    </p>
  );
}
